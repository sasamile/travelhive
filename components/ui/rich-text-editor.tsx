"use client";

import { useRef, useEffect, useState } from "react";
import { Bold, Italic, List, AlignLeft } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Función para verificar si el contenido está vacío
  const checkIfEmpty = (html: string) => {
    if (!html) return true;
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text === '' || text === '<br>';
  };

  // Detectar si el componente está montado (solo en cliente)
  useEffect(() => {
    setIsMounted(true);
    // Determinar si está vacío basado en el valor inicial
    const hasContent = value && value !== "" && value !== "<br>" && value.trim() !== "";
    setIsEmpty(!hasContent);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
      // Actualizar estado de vacío basado en el nuevo valor
      const hasContent = value && value !== "" && value !== "<br>" && value.trim() !== "";
      setIsEmpty(!hasContent);
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      // Actualizar estado de vacío en tiempo real
      setIsEmpty(checkIfEmpty(content));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Asegurar que el placeholder desaparezca inmediatamente al hacer focus
    if (editorRef.current) {
      setIsEmpty(checkIfEmpty(editorRef.current.innerHTML));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Verificar si está vacío al perder el focus
    if (editorRef.current) {
      setIsEmpty(checkIfEmpty(editorRef.current.innerHTML));
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`border border-neutral-200 rounded-2xl overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
        <button
          type="button"
          className="p-2 hover:bg-neutral-200 rounded transition-colors"
          onClick={() => execCommand("bold")}
          title="Negrita"
        >
          <Bold className="w-4 h-4 text-slate-700" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-neutral-200 rounded transition-colors"
          onClick={() => execCommand("italic")}
          title="Cursiva"
        >
          <Italic className="w-4 h-4 text-slate-700" />
        </button>
        <div className="w-px h-6 bg-neutral-300 mx-1" />
        <button
          type="button"
          className="p-2 hover:bg-neutral-200 rounded transition-colors"
          onClick={() => execCommand("insertUnorderedList")}
          title="Lista con viñetas"
        >
          <List className="w-4 h-4 text-slate-700" />
        </button>
      </div>
      
      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`min-h-[180px] p-4 text-sm focus:outline-none relative z-10 ${
            isFocused ? "ring-2 ring-indigo-500/20" : ""
          }`}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          } as any}
          suppressContentEditableWarning
        />
        {/* Placeholder overlay - solo se muestra cuando está vacío y no tiene focus */}
        {isEmpty && isMounted && !isFocused && (
          <div
            className="absolute top-4 left-4 text-slate-400 pointer-events-none z-0 text-sm"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {placeholder}
          </div>
        )}
      </div>
      
    </div>
  );
}