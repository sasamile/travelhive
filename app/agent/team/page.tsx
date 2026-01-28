"use client";

import { AgentHeader } from '@/components/agent/AgentHeader';
import { UserPlus, Search, Edit, Trash2, Mail, X, Info, User, Filter, XCircle, Loader2, Copy, CheckCircle2, EyeOff, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

// Interfaces basadas en la respuesta de la API
interface ApiUser {
    id: string;
    email: string;
    name: string;
    dni?: string;
    phone?: string;
    picture?: string | null;
}

interface ApiMember {
    id: string;
    user: ApiUser;
    role: 'admin' | 'organizer' | 'jipper';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ApiMembersResponse {
    members: ApiMember[];
    total: number;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    dni: string;
    role: 'Admin' | 'Organizer' | 'Jipper';
    status: 'Active' | 'Pending';
    avatar?: string;
    joinedDate: string;
    temporaryPassword?: string;
}

interface MemberFormData {
    email: string;
    name: string;
    role: 'admin' | 'organizer' | 'jipper';
    dni?: string;
    phone?: string;
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');
    const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Organizer' | 'Jipper'>('All');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [dniFilter, setDniFilter] = useState('');
    const [debouncedPhoneFilter, setDebouncedPhoneFilter] = useState('');
    const [debouncedDniFilter, setDebouncedDniFilter] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [temporaryPasswords, setTemporaryPasswords] = useState<Record<string, string>>({});
    
    const membersPerPage = 4;
    const containerRef = useRef<HTMLDivElement>(null);
    const filtersRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState<MemberFormData>({
        email: '',
        name: '',
        role: 'organizer',
        dni: '',
        phone: '',
    });

    // Mapear datos de la API al formato del componente
    const mapApiMemberToTeamMember = (apiMember: ApiMember): TeamMember & { userId: string } => {
        return {
            id: apiMember.id,
            userId: apiMember.user.id,
            name: apiMember.user.name,
            email: apiMember.user.email,
            phone: apiMember.user.phone || '',
            dni: apiMember.user.dni || '',
            role: apiMember.role.charAt(0).toUpperCase() + apiMember.role.slice(1) as 'Admin' | 'Organizer' | 'Jipper',
            status: apiMember.isActive ? 'Active' : 'Pending',
            avatar: apiMember.user.picture || undefined,
            joinedDate: format(new Date(apiMember.createdAt), 'dd MMM yyyy'),
        };
    };

    // Cargar miembros desde la API con filtros del backend
    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setHasPermission(true);
            
            // Construir parámetros de query
            const params: any = {};
            
            // Filtro por estado (isActive)
            if (statusFilter === 'Active') {
                params.isActive = true;
            } else if (statusFilter === 'Pending') {
                params.isActive = false;
            }
            
            // Filtro por rol
            if (roleFilter !== 'All') {
                params.role = roleFilter.toLowerCase();
            }
            
            // Filtro por teléfono (usar valor con debounce)
            if (debouncedPhoneFilter.trim()) {
                params.phone = debouncedPhoneFilter.trim();
            }
            
            // Filtro por DNI (usar valor con debounce)
            if (debouncedDniFilter.trim()) {
                params.dni = debouncedDniFilter.trim();
            }
            
            // Búsqueda general (nombre o email)
            if (debouncedSearchQuery.trim()) {
                params.search = debouncedSearchQuery.trim();
            }
            
            const response = await api.get<ApiMembersResponse>('/agencies/members', { params });
            
            if (response.data && response.data.members) {
                // Mapear todos los miembros devueltos por el backend (ya filtrados)
                const mappedMembers = response.data.members.map(mapApiMemberToTeamMember);
                setMembers(mappedMembers);
            }
        } catch (error: any) {
            console.error('Error al cargar miembros:', error);
            
            // Si el error es 403, el usuario no tiene permisos de administrador
            if (error.response?.status === 403) {
                setHasPermission(false);
                toast.error('No tienes permisos para ver los miembros del equipo. Solo los administradores pueden acceder a esta sección.');
                setMembers([]);
            } else {
                toast.error(error.response?.data?.message || 'Error al cargar los miembros del equipo');
                setMembers([]);
            }
        } finally {
            setLoading(false);
        }
    }, [statusFilter, roleFilter, debouncedPhoneFilter, debouncedDniFilter, debouncedSearchQuery]);

    // Obtener usuario actual
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data?.user?.id) {
                    setCurrentUserId(response.data.user.id);
                }
            } catch (error) {
                console.error('Error al obtener usuario actual:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // Debounce para búsqueda general
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounce para teléfono
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPhoneFilter(phoneFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [phoneFilter]);

    // Debounce para DNI
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDniFilter(dniFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [dniFilter]);

    // Cargar miembros cuando cambien los filtros o la búsqueda (usando valores con debounce)
    useEffect(() => {
        fetchMembers();
    }, [statusFilter, roleFilter, debouncedPhoneFilter, debouncedDniFilter, debouncedSearchQuery]);

    // Animaciones GSAP más elaboradas
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            // Timeline principal para animaciones coordinadas
            const tl = gsap.timeline();

            // Animación de entrada para los filtros con efecto de onda
            tl.fromTo(
                ".filter-item",
                {
                    opacity: 0,
                    y: -20,
                    scale: 0.9,
                    rotationX: -15,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotationX: 0,
                    duration: 0.6,
                    stagger: {
                        amount: 0.3,
                        from: "start",
                    },
                    ease: "back.out(1.7)",
                }
            );

            // Animación de entrada para las filas de la tabla con efecto de cascada
            tl.fromTo(
                ".member-row",
                {
                    opacity: 0,
                    x: -50,
                    y: 20,
                    scale: 0.9,
                    rotationY: -10,
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotationY: 0,
                    duration: 0.7,
                    stagger: {
                        amount: 0.4,
                        from: "start",
                    },
                    ease: "power3.out",
                },
                "-=0.2"
            );

            // Animación para los badges de rol con efecto bounce
            gsap.fromTo(
                ".role-badge",
                {
                    opacity: 0,
                    scale: 0,
                    rotation: -180,
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "elastic.out(1, 0.5)",
                    delay: 0.3,
                }
            );

            // Animación para los indicadores de estado
            gsap.fromTo(
                ".status-indicator",
                {
                    opacity: 0,
                    scale: 0,
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.03,
                    ease: "back.out(2)",
                    delay: 0.4,
                }
            );

            // Animación para los avatares con efecto de zoom
            gsap.fromTo(
                ".member-avatar",
                {
                    opacity: 0,
                    scale: 0,
                    rotation: 360,
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    stagger: 0.05,
                    ease: "elastic.out(1, 0.6)",
                    delay: 0.2,
                }
            );

            // Animación para los botones de acción con efecto de aparición
            gsap.fromTo(
                ".action-button",
                {
                    opacity: 0,
                    scale: 0.5,
                    rotation: -90,
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "back.out(1.5)",
                    delay: 0.5,
                }
            );

            // Animación para el header de la tabla
            gsap.fromTo(
                ".table-header",
                {
                    opacity: 0,
                    y: -30,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out",
                }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [loading, members, currentPage]);

    // Animaciones al cambiar filtros
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            // Animación de salida y entrada cuando cambian los filtros con efecto más dramático
            gsap.to(".member-row", {
                opacity: 0,
                x: -50,
                y: 20,
                scale: 0.9,
                rotationY: -15,
                duration: 0.3,
                stagger: {
                    amount: 0.2,
                    from: "start",
                },
                ease: "power2.in",
                onComplete: () => {
                    gsap.fromTo(
                        ".member-row",
                        {
                            opacity: 0,
                            x: 50,
                            y: -20,
                            scale: 0.9,
                            rotationY: 15,
                        },
                        {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            scale: 1,
                            rotationY: 0,
                            duration: 0.6,
                            stagger: {
                                amount: 0.3,
                                from: "start",
                            },
                            ease: "power3.out",
                        }
                    );
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, [statusFilter, roleFilter, debouncedPhoneFilter, debouncedDniFilter, debouncedSearchQuery]);

            // Animación para el modal de email
    useEffect(() => {
        if (isEmailModalOpen) {
            setTimeout(() => {
                gsap.fromTo(
                    ".email-modal",
                    {
                        opacity: 0,
                        scale: 0.8,
                        y: 30,
                        rotation: -5,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        rotation: 0,
                        duration: 0.5,
                        ease: "back.out(1.7)",
                    }
                );
                
                gsap.fromTo(
                    ".email-modal-backdrop",
                    {
                        opacity: 0,
                    },
                    {
                        opacity: 1,
                        duration: 0.3,
                        ease: "power2.out",
                    }
                );
            }, 10);
        }
    }, [isEmailModalOpen]);

    // Obtener roles únicos de los miembros existentes
    const availableRoles = useMemo(() => {
        const roles = new Set(members.map(m => m.role));
        return Array.from(roles).sort();
    }, [members]);

    // Filtrar miembros (solo excluir el usuario actual, el resto del filtrado lo hace el backend)
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            // Excluir el usuario actual comparando el userId
            if (currentUserId && (member as any).userId === currentUserId) {
                return false;
            }
            return true;
        });
    }, [members, currentUserId]);

    const totalMembers = filteredMembers.length;
    const startIndex = (currentPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    const hasActiveFilters = statusFilter !== 'All' || roleFilter !== 'All' || phoneFilter || dniFilter;

    // Animación para estado vacío (después de definir paginatedMembers)
    useEffect(() => {
        if (!loading && paginatedMembers.length === 0 && filteredMembers.length === 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    ".empty-state",
                    {
                        opacity: 0,
                        scale: 0.8,
                        y: 20,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                    }
                );
            }, containerRef);

            return () => ctx.revert();
        }
    }, [loading, paginatedMembers.length, filteredMembers.length]);

    const clearFilters = () => {
        setStatusFilter('All');
        setRoleFilter('All');
        setPhoneFilter('');
        setDniFilter('');
        setCurrentPage(1);
    };

    const handleStatusChange = (value: 'All' | 'Active' | 'Pending') => {
        setStatusFilter(value);
        setCurrentPage(1);
        // fetchMembers se ejecutará automáticamente por el useEffect
    };

    const handleRoleChange = (value: 'All' | 'Admin' | 'Organizer' | 'Jipper') => {
        setRoleFilter(value);
        setCurrentPage(1);
        // fetchMembers se ejecutará automáticamente por el useEffect
    };

    const handlePhoneChange = (value: string) => {
        setPhoneFilter(value);
        setCurrentPage(1);
        // fetchMembers se ejecutará automáticamente por el useEffect
    };

    const handleDniChange = (value: string) => {
        setDniFilter(value);
        setCurrentPage(1);
        // fetchMembers se ejecutará automáticamente por el useEffect
    };

    // Abrir modal para crear nuevo miembro
    const handleCreateMember = () => {
        setEditingMember(null);
        setFormData({
            email: '',
            name: '',
            role: 'organizer',
            dni: '',
            phone: '',
        });
        setIsModalOpen(true);
        
        // Animación de entrada del modal
        setTimeout(() => {
            gsap.fromTo(
                ".member-modal",
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 50,
                    rotationX: -15,
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                }
            );
            
            gsap.fromTo(
                ".member-modal-backdrop",
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                }
            );
        }, 10);
    };

    // Abrir modal para editar miembro
    const handleEditMember = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            email: member.email,
            name: member.name,
            role: member.role.toLowerCase() as 'admin' | 'organizer' | 'jipper',
            dni: member.dni,
            phone: member.phone,
        });
        setIsModalOpen(true);
        
        // Animación de entrada del modal
        setTimeout(() => {
            gsap.fromTo(
                ".member-modal",
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 50,
                    rotationX: -15,
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                }
            );
            
            gsap.fromTo(
                ".member-modal-backdrop",
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                }
            );
        }, 10);
    };


    // Copiar contraseña al portapapeles
    const handleCopyPassword = async (password: string) => {
        try {
            await navigator.clipboard.writeText(password);
            setCopiedPassword(true);
            toast.success('Contraseña copiada al portapapeles');
            setTimeout(() => setCopiedPassword(false), 2000);
        } catch (error) {
            toast.error('Error al copiar la contraseña');
        }
    };

    // Crear o actualizar miembro
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
            
            const payload: Partial<MemberFormData> = {
                email: formData.email,
                name: formData.name,
                role: formData.role,
            };
            
            if (formData.dni) payload.dni = formData.dni;
            if (formData.phone) payload.phone = formData.phone;

            if (editingMember) {
                // Actualizar miembro existente
                await api.patch(`/agencies/members/${editingMember.id}`, payload);
                toast.success('Miembro actualizado exitosamente');
                setIsModalOpen(false);
            } else {
                // Crear nuevo miembro
                const response = await api.post('/agencies/members', payload);
                const tempPassword = response.data?.data?.temporaryPassword;
                
                if (tempPassword) {
                    // Guardar la contraseña temporal en el estado del miembro y en el mapa de contraseñas
                    const newMember = {
                        ...mapApiMemberToTeamMember(response.data.data),
                        temporaryPassword: tempPassword,
                    };
                    // Guardar la contraseña temporal asociada al ID del miembro
                    setTemporaryPasswords(prev => ({
                        ...prev,
                        [newMember.id]: tempPassword
                    }));
                    setSelectedMember(newMember);
                    setIsModalOpen(false);
                    setIsEmailModalOpen(true);
                } else {
                    toast.success('Miembro creado exitosamente');
                    setIsModalOpen(false);
                }
            }
            
            await fetchMembers();
        } catch (error: any) {
            console.error('Error al guardar miembro:', error);
            toast.error(error.response?.data?.message || 'Error al guardar el miembro');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Abrir modal de confirmación para eliminar
    const handleDeleteClick = (member: TeamMember) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
        
        // Animación de entrada del modal de eliminación
        setTimeout(() => {
            gsap.fromTo(
                ".delete-modal",
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 30,
                    rotation: -5,
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotation: 0,
                    duration: 0.5,
                    ease: "back.out(1.7)",
                }
            );
            
            gsap.fromTo(
                ".delete-modal-backdrop",
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                }
            );
        }, 10);
    };

    // Eliminar miembro
    const handleDeleteMember = async () => {
        if (!memberToDelete) return;

        try {
            setDeletingId(memberToDelete.id);
            await api.delete(`/agencies/members/${memberToDelete.id}`);
            toast.success('Miembro eliminado exitosamente');
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
            await fetchMembers();
        } catch (error: any) {
            console.error('Error al eliminar miembro:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar el miembro');
        } finally {
            setDeletingId(null);
        }
    };

    // Activar/Desactivar miembro
    const handleToggleActive = async (member: TeamMember) => {
        try {
            setTogglingId(member.id);
            const newActiveState = member.status === 'Active' ? false : true;
            
            const response = await api.put(`/agencies/members/${member.id}/active`, {
                isActive: newActiveState,
            });
            
            // Actualizar el estado local inmediatamente con animación
            setMembers(prevMembers => 
                prevMembers.map(m => {
                    if (m.id === member.id) {
                        // Animar el cambio de estado
                        setTimeout(() => {
                            const statusElement = document.querySelector(`[data-member-id="${member.id}"] .status-indicator`);
                            if (statusElement) {
                                gsap.fromTo(
                                    statusElement,
                                    {
                                        scale: 0,
                                        rotation: -180,
                                    },
                                    {
                                        scale: 1,
                                        rotation: 0,
                                        duration: 0.5,
                                        ease: "elastic.out(1, 0.6)",
                                    }
                                );
                            }
                        }, 10);
                        
                        return { ...m, status: newActiveState ? 'Active' : 'Pending' };
                    }
                    return m;
                })
            );
            
            toast.success(`Miembro ${newActiveState ? 'activado' : 'desactivado'} exitosamente`);
            
            // Recargar para asegurar sincronización con el backend
            await fetchMembers();
        } catch (error: any) {
            console.error('Error al cambiar estado:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar el estado del miembro');
            // Recargar en caso de error para restaurar el estado correcto
            await fetchMembers();
        } finally {
            setTogglingId(null);
        }
    };

    const getRoleBadgeClass = (role: string) => {
        if (role === 'Admin') {
            return 'px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold';
        }
        if (role === 'Jipper') {
            return 'px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold';
        }
        return 'px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold';
    };

    const getStatusIndicator = (status: string) => {
        if (status === 'Active') {
            return (
                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-medium text-zinc-700">Active</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs font-medium text-zinc-700">Pending</span>
            </div>
        );
    };

    return (
        <main className="flex-1 flex flex-col bg-lineal-to-br from-zinc-50 via-white to-zinc-50" ref={containerRef}>
            <AgentHeader
                title="Team Members"
                titleWithSearch
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    hasPermission && (
                        <button 
                            onClick={handleCreateMember}
                            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm"
                            onMouseEnter={(e) => {
                                gsap.to(e.currentTarget, {
                                    scale: 1.05,
                                    y: -2,
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                    duration: 0.3,
                                    ease: "back.out(1.7)",
                                });
                            }}
                            onMouseLeave={(e) => {
                                gsap.to(e.currentTarget, {
                                    scale: 1,
                                    y: 0,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    duration: 0.3,
                                    ease: "power2.out",
                                });
                            }}
                        >
                            <UserPlus className="size-4" />
                            Invite Member
                        </button>
                    )
                }
            />

            <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
                {/* Mensaje de sin permisos */}
                {!hasPermission && !loading && (
                    <div className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <X className="size-8 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">Acceso Restringido</h3>
                                    <p className="text-sm text-zinc-600 max-w-md">
                                        Solo los administradores pueden ver y gestionar los miembros del equipo. 
                                        Si necesitas acceso a esta funcionalidad, contacta con un administrador de la agencia.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros mejorados */}
                {hasPermission && (
                    <div ref={filtersRef} className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Filter className="size-4 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 font-caveat">Filtros</h3>
                                <p className="text-xs text-zinc-500">Filtra y encuentra miembros rápidamente</p>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                                onMouseEnter={(e) => {
                                    gsap.to(e.currentTarget, {
                                        scale: 1.1,
                                        rotation: 5,
                                        duration: 0.2,
                                        ease: "back.out(1.7)",
                                    });
                                }}
                                onMouseLeave={(e) => {
                                    gsap.to(e.currentTarget, {
                                        scale: 1,
                                        rotation: 0,
                                        duration: 0.2,
                                        ease: "power2.out",
                                    });
                                }}
                            >
                                <XCircle className="size-3.5" />
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Filtro por Estado */}
                            <div className="filter-item">
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-tight mb-2">Estado</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value as 'All' | 'Active' | 'Pending')}
                                    className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    onFocus={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1.02,
                                            duration: 0.2,
                                            ease: "power2.out",
                                        });
                                    }}
                                    onBlur={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1,
                                            duration: 0.2,
                                            ease: "power2.out",
                                        });
                                    }}
                                >
                                    <option value="All">Todos los estados</option>
                                    <option value="Active">Solo activos</option>
                                    <option value="Pending">Solo inactivos</option>
                                </select>
                            </div>

                            {/* Filtro por Rol - Solo muestra roles que existen */}
                            {availableRoles.length > 0 && (
                                <div className="filter-item">
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-tight mb-2">Rol</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => handleRoleChange(e.target.value as 'All' | 'Admin' | 'Organizer' | 'Jipper')}
                                        className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        onFocus={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                duration: 0.2,
                                                ease: "power2.out",
                                            });
                                        }}
                                        onBlur={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1,
                                                duration: 0.2,
                                                ease: "power2.out",
                                            });
                                        }}
                                    >
                                        <option value="All">Todos los roles</option>
                                        {availableRoles.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Búsqueda por teléfono */}
                            <div className="filter-item">
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-tight mb-2">Teléfono</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={phoneFilter}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="Buscar por teléfono..."
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        onFocus={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                x: 2,
                                                duration: 0.2,
                                                ease: "power2.out",
                                            });
                                        }}
                                        onBlur={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1,
                                                x: 0,
                                                duration: 0.2,
                                                ease: "power2.out",
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Búsqueda por DNI */}
                            <div className="filter-item">
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-tight mb-2">DNI / NIT</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={dniFilter}
                                        onChange={(e) => handleDniChange(e.target.value)}
                                        placeholder="Buscar por DNI/NIT..."
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        onFocus={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                x: 2,
                                                duration: 0.2,
                                                ease: "power2.out",
                                            });
                                        }}
                                        onBlur={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1,
                                                x: 0,
                                                duration: 0.2,
                                                ease: "power2.out",
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                )}

                {/* Tabla de miembros */}
                {hasPermission && (
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="table-header border-b border-zinc-200 bg-zinc-50/50">
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Miembro</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">DNI/ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-3 py-2 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <tr key={`skeleton-${index}`} className="animate-pulse">
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-full bg-zinc-200 shrink-0"></div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                                                        <div className="h-2 w-20 bg-zinc-200 rounded"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="h-3 w-32 bg-zinc-200 rounded"></div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="h-3 w-20 bg-zinc-200 rounded"></div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="h-5 w-16 bg-zinc-200 rounded-full"></div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="h-3 w-14 bg-zinc-200 rounded"></div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-1">
                                                    <div className="size-6 bg-zinc-200 rounded-lg"></div>
                                                    <div className="size-6 bg-zinc-200 rounded-lg"></div>
                                                    <div className="size-6 bg-zinc-200 rounded-lg"></div>
                                                    <div className="size-6 bg-zinc-200 rounded-lg"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : paginatedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3 empty-state">
                                                <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center">
                                                    <User className="size-8 text-zinc-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">No se encontraron miembros</p>
                                                    <p className="text-xs text-zinc-500 mt-1">Intenta ajustar los filtros o crear un nuevo miembro</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedMembers.map((member, index) => (
                                        <tr 
                                            key={member.id} 
                                            className="member-row hover:bg-zinc-50/50 transition-colors group"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    {member.avatar ? (
                                                        <div 
                                                            className="member-avatar size-8 rounded-full bg-zinc-100 overflow-hidden shrink-0 ring-2 ring-zinc-200 group-hover:ring-indigo-300 transition-all cursor-pointer"
                                                            onMouseEnter={(e) => {
                                                                gsap.to(e.currentTarget, {
                                                                    scale: 1.1,
                                                                    rotation: 5,
                                                                    duration: 0.3,
                                                                    ease: "back.out(1.7)",
                                                                });
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                gsap.to(e.currentTarget, {
                                                                    scale: 1,
                                                                    rotation: 0,
                                                                    duration: 0.3,
                                                                    ease: "power2.out",
                                                                });
                                                            }}
                                                        >
                                                            <img
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                                src={member.avatar}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className="member-avatar size-8 rounded-full bg-lineal-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 ring-2 ring-zinc-200 group-hover:ring-indigo-300 transition-all cursor-pointer"
                                                            onMouseEnter={(e) => {
                                                                gsap.to(e.currentTarget, {
                                                                    scale: 1.1,
                                                                    rotation: 5,
                                                                    duration: 0.3,
                                                                    ease: "back.out(1.7)",
                                                                });
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                gsap.to(e.currentTarget, {
                                                                    scale: 1,
                                                                    rotation: 0,
                                                                    duration: 0.3,
                                                                    ease: "power2.out",
                                                                });
                                                            }}
                                                        >
                                                            <User className="size-4 text-indigo-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-zinc-900">{member.name}</p>
                                                        <p className="text-xs text-zinc-500">{member.joinedDate}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-zinc-700 text-sm">{member.email}</td>
                                            <td className="px-3 py-2 text-zinc-600 text-sm">
                                                {member.phone || <span className="text-zinc-400 italic">No proporcionado</span>}
                                            </td>
                                            <td className="px-3 py-2 text-zinc-600 text-sm tabular-nums">
                                                {member.dni || <span className="text-zinc-400 italic">Pendiente</span>}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={cn(getRoleBadgeClass(member.role), "role-badge inline-block cursor-pointer")}
                                                    onMouseEnter={(e) => {
                                                        gsap.to(e.currentTarget, {
                                                            scale: 1.1,
                                                            y: -2,
                                                            duration: 0.2,
                                                            ease: "power2.out",
                                                        });
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        gsap.to(e.currentTarget, {
                                                            scale: 1,
                                                            y: 0,
                                                            duration: 0.2,
                                                            ease: "power2.out",
                                                        });
                                                    }}
                                                >
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="status-indicator" data-member-id={member.id}>
                                                    {getStatusIndicator(member.status)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setViewingMember(member);
                                                            setIsInfoModalOpen(true);
                                                            setTimeout(() => {
                                                                gsap.fromTo(
                                                                    ".info-member-modal",
                                                                    {
                                                                        opacity: 0,
                                                                        scale: 0.8,
                                                                        y: 50,
                                                                        rotationX: -15,
                                                                    },
                                                                    {
                                                                        opacity: 1,
                                                                        scale: 1,
                                                                        y: 0,
                                                                        rotationX: 0,
                                                                        duration: 0.6,
                                                                        ease: "back.out(1.7)",
                                                                    }
                                                                );
                                                            }, 10);
                                                        }}
                                                        className="action-button p-2 hover:bg-indigo-50 rounded-lg text-zinc-400 hover:text-indigo-600 transition-all"
                                                        title="Ver información"
                                                    >
                                                        <Info className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMember(member)}
                                                        className="action-button p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(member)}
                                                        disabled={deletingId === member.id}
                                                        className="action-button p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-all disabled:opacity-50"
                                                        title="Eliminar"
                                                    >
                                                        {deletingId === member.id ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/30">
                        <p className="text-xs text-zinc-500">
                            Mostrando <span className="font-semibold text-zinc-900">{startIndex + 1}-{Math.min(endIndex, totalMembers)}</span> de{' '}
                            <span className="font-semibold text-zinc-900">{totalMembers}</span> miembros
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                        gsap.to(e.currentTarget, {
                                            scale: 1.05,
                                            x: -2,
                                            duration: 0.2,
                                            ease: "back.out(1.7)",
                                        });
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    gsap.to(e.currentTarget, {
                                        scale: 1,
                                        x: 0,
                                        duration: 0.2,
                                        ease: "power2.out",
                                    });
                                }}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={endIndex >= totalMembers}
                                className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                        gsap.to(e.currentTarget, {
                                            scale: 1.05,
                                            x: 2,
                                            duration: 0.2,
                                            ease: "back.out(1.7)",
                                        });
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    gsap.to(e.currentTarget, {
                                        scale: 1,
                                        x: 0,
                                        duration: 0.2,
                                        ease: "power2.out",
                                    });
                                }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Info box */}
                {hasPermission && (
                    <div 
                        className="info-box p-6 bg-lineal-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
                        onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, {
                                scale: 1.02,
                                y: -3,
                                boxShadow: "0 10px 30px rgba(99, 102, 241, 0.2)",
                                duration: 0.3,
                                ease: "power2.out",
                            });
                        }}
                        onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, {
                                scale: 1,
                                y: 0,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                duration: 0.3,
                                ease: "power2.out",
                            });
                        }}
                    >
                    <div className="flex gap-4">
                        <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                            <Info className="size-5 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900 mb-1">Información de Roles y Permisos</h4>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                <span className="font-semibold text-zinc-700">Admins</span> tienen control total sobre la agencia, facturación y gestión de miembros.{' '}
                                <span className="font-semibold text-zinc-700">Organizers</span> pueden crear y gestionar expediciones, comunicarse con viajeros y ver reportes específicos.{' '}
                                <span className="font-semibold text-zinc-700">Jippers</span> tienen permisos limitados para tareas específicas.
                            </p>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Modal para crear/editar miembro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="member-modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setIsModalOpen(false)}
                    />
                    
                    <div className="member-modal relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-xl font-bold text-zinc-900">
                                {editingMember ? 'Editar Miembro' : 'Invitar Nuevo Miembro'}
                            </h3>
                            <button
                                onClick={() => !isSubmitting && setIsModalOpen(false)}
                                disabled={isSubmitting}
                                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="form-field">
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Juan Pérez"
                                    onFocus={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1.02,
                                            y: -2,
                                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                            duration: 0.3,
                                            ease: "power2.out",
                                        });
                                    }}
                                    onBlur={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1,
                                            y: 0,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            duration: 0.3,
                                            ease: "power2.out",
                                        });
                                    }}
                                />
                            </div>

                            <div className="form-field">
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="miembro@example.com"
                                    onFocus={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1.02,
                                            y: -2,
                                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                            duration: 0.3,
                                            ease: "power2.out",
                                        });
                                    }}
                                    onBlur={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1,
                                            y: 0,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            duration: 0.3,
                                            ease: "power2.out",
                                        });
                                    }}
                                />
                            </div>

                            <div className="form-field">
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Rol *
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'organizer' | 'jipper' })}
                                    className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    onFocus={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1.02,
                                            y: -2,
                                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                            duration: 0.3,
                                            ease: "power2.out",
                                        });
                                    }}
                                    onBlur={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1,
                                            y: 0,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            duration: 0.3,
                                            ease: "power2.out",
                                        });
                                    }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="organizer">Organizer</option>
                                    <option value="jipper">Jipper</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-field">
                                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="+57 300 123 4567"
                                        onFocus={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                y: -2,
                                                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                                duration: 0.3,
                                                ease: "power2.out",
                                            });
                                        }}
                                        onBlur={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1,
                                                y: 0,
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                duration: 0.3,
                                                ease: "power2.out",
                                            });
                                        }}
                                    />
                                </div>

                                <div className="form-field">
                                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                        DNI/NIT
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="1234567890"
                                        onFocus={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                y: -2,
                                                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                                duration: 0.3,
                                                ease: "power2.out",
                                            });
                                        }}
                                        onBlur={(e) => {
                                            gsap.to(e.currentTarget, {
                                                scale: 1,
                                                y: 0,
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                duration: 0.3,
                                                ease: "power2.out",
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                                    onMouseEnter={(e) => {
                                        if (!e.currentTarget.disabled) {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                y: -2,
                                                duration: 0.2,
                                                ease: "back.out(1.7)",
                                            });
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1,
                                            y: 0,
                                            duration: 0.2,
                                            ease: "power2.out",
                                        });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    onMouseEnter={(e) => {
                                        if (!e.currentTarget.disabled) {
                                            gsap.to(e.currentTarget, {
                                                scale: 1.02,
                                                y: -2,
                                                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                                                duration: 0.2,
                                                ease: "back.out(1.7)",
                                            });
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        gsap.to(e.currentTarget, {
                                            scale: 1,
                                            y: 0,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            duration: 0.2,
                                            ease: "power2.out",
                                        });
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        editingMember ? 'Actualizar' : 'Crear Miembro'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de correo con contraseña */}
            {isEmailModalOpen && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="email-modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsEmailModalOpen(false)}
                    />
                    
                    <div className="email-modal relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Mail className="size-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900">Enviar Credenciales</h3>
                            </div>
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-zinc-600 mb-4">
                                    Las credenciales de acceso para <span className="font-semibold text-zinc-900">{selectedMember.name}</span> han sido generadas.
                                </p>
                                
                                {selectedMember.temporaryPassword && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase">Contraseña Temporal</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-sm text-zinc-900">
                                                {selectedMember.temporaryPassword}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyPassword(selectedMember.temporaryPassword!)}
                                                className="px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                                title="Copiar contraseña"
                                            >
                                                {copiedPassword ? (
                                                    <CheckCircle2 className="size-5" />
                                                ) : (
                                                    <Copy className="size-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-800">
                                        <strong>Importante:</strong> Comparte estas credenciales de forma segura con el nuevo miembro. 
                                        Se recomienda enviarlas por correo electrónico o un canal seguro.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setIsEmailModalOpen(false)}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedMember.temporaryPassword) {
                                            window.location.href = `mailto:${selectedMember.email}?subject=Credenciales de acceso&body=Hola ${selectedMember.name},%0D%0A%0D%0ATus credenciales de acceso son:%0D%0AEmail: ${selectedMember.email}%0D%0AContraseña temporal: ${selectedMember.temporaryPassword}%0D%0A%0D%0APor favor, cambia tu contraseña después del primer inicio de sesión.`;
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail className="size-4" />
                                    Abrir Correo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {isDeleteModalOpen && memberToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="delete-modal-backdrop absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsDeleteModalOpen(false)}
                    />
                    
                    <div className="delete-modal relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="size-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900">Confirmar Eliminación</h3>
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-zinc-600">
                                ¿Estás seguro de que deseas eliminar a <span className="font-semibold text-zinc-900">{memberToDelete.name}</span> del equipo?
                            </p>
                            <p className="text-xs text-zinc-500">
                                Esta acción no se puede deshacer. El miembro perderá acceso inmediatamente.
                            </p>

                            <div className="flex gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={deletingId === memberToDelete.id}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteMember}
                                    disabled={deletingId === memberToDelete.id}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deletingId === memberToDelete.id ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Eliminar Miembro'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de información del miembro */}
            {isInfoModalOpen && viewingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsInfoModalOpen(false)}
                    />
                    
                    <div className="info-member-modal relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Info className="size-5 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900">Información del Miembro</h3>
                            </div>
                            <button
                                onClick={() => setIsInfoModalOpen(false)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Header con avatar y nombre */}
                            <div className="flex items-center gap-4 pb-6 border-b border-zinc-200">
                                {viewingMember.avatar ? (
                                    <div className="size-20 rounded-full bg-zinc-100 overflow-hidden shrink-0 ring-4 ring-zinc-200">
                                        <img
                                            alt={viewingMember.name}
                                            className="w-full h-full object-cover"
                                            src={viewingMember.avatar}
                                        />
                                    </div>
                                ) : (
                                    <div className="size-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 ring-4 ring-zinc-200">
                                        <User className="size-10 text-indigo-600" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-2xl font-bold text-zinc-900 mb-1">{viewingMember.name}</h4>
                                    <p className="text-sm text-zinc-500">Miembro desde {viewingMember.joinedDate}</p>
                                </div>
                            </div>

                            {/* Información detallada */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">Email</label>
                                    <p className="text-sm font-medium text-zinc-900">{viewingMember.email}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">Teléfono</label>
                                    <p className="text-sm font-medium text-zinc-900">
                                        {viewingMember.phone || <span className="text-zinc-400 italic">No proporcionado</span>}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">DNI/NIT</label>
                                    <p className="text-sm font-medium text-zinc-900">
                                        {viewingMember.dni || <span className="text-zinc-400 italic">Pendiente</span>}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">Rol</label>
                                    <div>
                                        <span className={cn(getRoleBadgeClass(viewingMember.role), "inline-block")}>
                                            {viewingMember.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">Estado</label>
                                    <div>
                                        {getStatusIndicator(viewingMember.status)}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">Fecha de Ingreso</label>
                                    <p className="text-sm font-medium text-zinc-900">{viewingMember.joinedDate}</p>
                                </div>
                            </div>

                            {/* Contraseña Temporal */}
                            {temporaryPasswords[viewingMember.id] && (
                                <div className="pt-4 border-t border-zinc-200">
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase mb-2">Contraseña Temporal</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-sm text-zinc-900">
                                            {temporaryPasswords[viewingMember.id]}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyPassword(temporaryPasswords[viewingMember.id])}
                                            className="px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center"
                                            title="Copiar contraseña"
                                        >
                                            {copiedPassword ? (
                                                <CheckCircle2 className="size-5" />
                                            ) : (
                                                <Copy className="size-5" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Esta contraseña fue generada cuando se creó el miembro. Compártela de forma segura.
                                    </p>
                                </div>
                            )}

                            {/* Descripción de permisos según el rol */}
                            <div className="pt-4 border-t border-zinc-200">
                                <h5 className="text-sm font-semibold text-zinc-900 mb-2">Permisos y Accesos</h5>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    {viewingMember.role === 'Admin' && (
                                        <>Los <span className="font-semibold">Admins</span> tienen control total sobre la agencia, incluyendo facturación, gestión de miembros, creación y edición de expediciones, y acceso a todos los reportes y analíticas.</>
                                    )}
                                    {viewingMember.role === 'Organizer' && (
                                        <>Los <span className="font-semibold">Organizers</span> pueden crear y gestionar expediciones, comunicarse con viajeros, ver reportes específicos y gestionar reservas. No tienen acceso a la configuración de la agencia ni a la gestión de miembros.</>
                                    )}
                                    {viewingMember.role === 'Jipper' && (
                                        <>Los <span className="font-semibold">Jippers</span> tienen permisos limitados para tareas específicas asignadas por los administradores. Pueden ver información básica pero no pueden crear o modificar expediciones.</>
                                    )}
                                </p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsInfoModalOpen(false);
                                        handleEditMember(viewingMember);
                                    }}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="size-4" />
                                    Editar Miembro
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInfoModalOpen(false)}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
