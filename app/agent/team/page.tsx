"use client";

import { AgentHeader } from '@/components/agent/AgentHeader';
import { Settings, UserPlus, Search, Edit, Trash2, Mail, X, Info, User, Filter, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    dni: string;
    role: 'Admin' | 'Organizer';
    status: 'Active' | 'Pending';
    avatar?: string;
    joinedDate: string;
}

const mockMembers: TeamMember[] = [
    {
        id: '1',
        name: 'Sarah Miller',
        email: 'sarah.m@blackwood.com',
        phone: '+1 (555) 0123',
        dni: '48291039-B',
        role: 'Admin',
        status: 'Active',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6pY8I717Unk34emnEfEpbzQBgFMKAyMPODHRexfJehdSSnrCjJCzx5-V3eGQWnOgbV8EfkTt87NcqaPzfrMcj4y6KsnCzkTgUbPVb7K2VJO5SIKB9xGVwN4yrInpDbcBk_W8UTOUKkTkqVKXc9lti6UTCeCfKfU9NZF94otW8kIMqCUpkIoBsJWWVhM80ubxcBiqf38fb6qPIf2IJq78FgArMhSwPs6WAFeLXa4gRwjclgTrSlJzL3i_amhmxszsKq_JhHH6CAPo',
        joinedDate: '12 Oct 2023',
    },
    {
        id: '2',
        name: 'Elena Rodriguez',
        email: 'elena.r@blackwood.com',
        phone: '+34 612 345 678',
        dni: '12345678-X',
        role: 'Organizer',
        status: 'Active',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6zYlPAKXA2DpqsLesPS4aCsI2qefORguRn93pfgF60lUdVmumKmUENx6ZQzN31LzN-BleD9MyJU0baA07bIiztkXxqmKtB3cVNB8QrClLuWsjpyLO8l_RV6edNMSkvDskD81QAtNQncj4rbXaoIdbi0uQo8zrju5jy6ovoGZ1OsZm-44VqMO8SMB1V5TJnkW0ddF79Wh36arxRSBmLoYJBYGBIjEXPPhSb9HYIw91lqao1Bg9lvxuvr1mTVfax7hEEqsn-X61Tjw',
        joinedDate: '05 Sep 2023',
    },
    {
        id: '3',
        name: 'Julian Casablancas',
        email: 'j.casa@outlook.com',
        phone: '',
        dni: '',
        role: 'Organizer',
        status: 'Pending',
        joinedDate: 'Invited today',
    },
    {
        id: '4',
        name: 'Marcus Tsoi',
        email: 'marcus@blackwood.com',
        phone: '+1 (555) 9876',
        dni: '99002233-K',
        role: 'Organizer',
        status: 'Active',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeB4eVqnQ4i5ehvmM6fm4DWtaKtcQEWiii0fR27OSFmwWOJKRNwEpsciCBqJPlEurEm9XW3pOjgdZdE1JvyviaqKmwaWrosKtBy0F6C_fjONYq_YFYH-wRAi5Bgou9DER_iO36Cwo0CSsOARLDeMqeSN1RZ5D3nnKJ__zPfzFISPrGWKfbAlLDEQOyAfW55RJ8FibUTsDAgk-FfOGUrKm8E2AIRBQkr1B9UvIbqAyT78dJobMCxHzXx5d0BIq04aOklVjWanvKFHE',
        joinedDate: '15 Aug 2023',
    },
];

export default function ProfilePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');
    const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Organizer'>('All');
    const [phoneDniFilter, setPhoneDniFilter] = useState('');
    const membersPerPage = 4;

    const filteredMembers = useMemo(() => {
        return mockMembers.filter(member => {
            // Filtro de búsqueda general (nombre y email)
            const matchesSearch = !searchQuery || 
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Filtro por estado
            const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
            
            // Filtro por rol
            const matchesRole = roleFilter === 'All' || member.role === roleFilter;
            
            // Filtro combinado por teléfono o DNI/NIT
            const matchesPhoneDni = !phoneDniFilter || 
                member.phone.toLowerCase().includes(phoneDniFilter.toLowerCase()) ||
                member.dni.toLowerCase().includes(phoneDniFilter.toLowerCase());
            
            return matchesSearch && matchesStatus && matchesRole && matchesPhoneDni;
        });
    }, [searchQuery, statusFilter, roleFilter, phoneDniFilter]);

    const totalMembers = filteredMembers.length;

    const startIndex = (currentPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    const hasActiveFilters = statusFilter !== 'All' || roleFilter !== 'All' || phoneDniFilter;

    const clearFilters = () => {
        setStatusFilter('All');
        setRoleFilter('All');
        setPhoneDniFilter('');
        setCurrentPage(1);
    };

    // Resetear página cuando cambien los filtros
    const handleStatusChange = (value: 'All' | 'Active' | 'Pending') => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleRoleChange = (value: 'All' | 'Admin' | 'Organizer') => {
        setRoleFilter(value);
        setCurrentPage(1);
    };

    const handlePhoneDniChange = (value: string) => {
        setPhoneDniFilter(value);
        setCurrentPage(1);
    };

    const getRoleBadgeClass = (role: string) => {
        if (role === 'Admin') {
            return 'px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase tracking-tight';
        }
        return 'px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-tight';
    };

    const getStatusIndicator = (status: string) => {
        if (status === 'Active') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-medium text-zinc-700">Active</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs font-medium text-zinc-700">Pending</span>
            </div>
        );
    };

    return (
        <main className="flex-1 flex flex-col">
            <AgentHeader
                title="Team Members"
              
                titleWithSearch
                actions={
                    <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm">
                        <UserPlus className="size-4" />
                        Invite Member
                    </button>
                }
            />

            <div className="p-8 max-w-7xl mx-auto w-full">
                {/* Filtros */}
                <div className="mb-6 bg-linear-to-br from-white to-zinc-50/50 border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-zinc-50/80 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Filter className="size-4 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Filters</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Refine your search</p>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-white rounded-lg transition-all border border-zinc-200"
                            >
                                <XCircle className="size-3.5" />
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Filtro por Estado */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-tight">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value as 'All' | 'Active' | 'Pending')}
                                    className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            {/* Filtro por Rol */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-tight">Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleRoleChange(e.target.value as 'All' | 'Admin' | 'Organizer')}
                                    className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Organizer">Organizer</option>
                                </select>
                            </div>

                            {/* Filtro combinado por Teléfono o DNI/NIT */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-tight">Phone / DNI/NIT</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={phoneDniFilter}
                                        onChange={(e) => handlePhoneDniChange(e.target.value)}
                                        placeholder="Search by phone or DNI/NIT..."
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50/30">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-tight">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-tight">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-tight">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-tight">DNI/ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-tight">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-tight">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-700 uppercase tracking-tight">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {paginatedMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {member.avatar ? (
                                                    <div className="size-8 rounded-full bg-zinc-100 overflow-hidden shrink-0">
                                                        <img
                                                            alt={member.name}
                                                            className="w-full h-full object-cover"
                                                            src={member.avatar}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                                        <User className="size-4 text-zinc-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-zinc-900">{member.name}</p>
                                                    <p className="text-[11px] text-zinc-500">{member.joinedDate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 text-sm">{member.email}</td>
                                        <td className="px-6 py-4 text-zinc-600 text-sm">
                                            {member.phone || <span className="text-zinc-400 italic">Not provided</span>}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 text-sm tabular-nums">
                                            {member.dni || <span className="text-zinc-400 italic">Pending</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={getRoleBadgeClass(member.role)}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusIndicator(member.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {member.status === 'Pending' ? (
                                                    <>
                                                        <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                                                            <Mail className="size-4" />
                                                        </button>
                                                        <button className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors">
                                                            <X className="size-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                                                            <Edit className="size-4" />
                                                        </button>
                                                        <button className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/30">
                        <p className="text-xs text-zinc-500">
                            Showing <span className="font-medium text-zinc-900">{startIndex + 1}-{Math.min(endIndex, totalMembers)}</span> of{' '}
                            <span className="font-medium text-zinc-900">{totalMembers}</span> members
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-400 bg-white cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={endIndex >= totalMembers}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="flex gap-4">
                        <Info className="size-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900">Role & Permission Info</h4>
                            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                                <span className="font-medium text-zinc-700">Admins</span> have full control over the agency, billing, and member management.{' '}
                                <span className="font-medium text-zinc-700">Organizers</span> can create and manage expeditions, communicate with travelers, and view specific reports.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
