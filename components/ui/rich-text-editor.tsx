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
    if (!editorRef.current) return;
    
    // Asegurar que el editor tenga focus antes de ejecutar el comando
    editorRef.current.focus();
    
    // Pequeño delay para asegurar que el focus esté establecido
    requestAnimationFrame(() => {
      try {
        // Ejecutar el comando
        const success = document.execCommand(command, false, value);
        
        if (!success && command === "insertUnorderedList") {
          // Si execCommand falla, crear la lista manualmente
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const ul = document.createElement("ul");
            const li = document.createElement("li");
            
            // Si hay texto seleccionado, usarlo
            if (range.toString().trim()) {
              li.textContent = range.toString();
              range.deleteContents();
            } else {
              li.textContent = "\u200B"; // Zero-width space para que la lista tenga contenido
            }
            
            ul.appendChild(li);
            range.insertNode(ul);
            
            // Colocar el cursor dentro del li
            const newRange = document.createRange();
            newRange.setStart(li, 0);
            newRange.setEnd(li, 0);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
        
        // Actualizar el contenido después de ejecutar el comando
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
          // Mantener el focus
          editorRef.current.focus();
        }
      } catch (error) {
        console.error("Error ejecutando comando:", error);
      }
    });
  };

  return (
    <div className={`border border-neutral-200 rounded-lg overflow-hidden bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-neutral-200 bg-neutral-50/50">
        <button
          type="button"
          className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
          onClick={() => execCommand("bold")}
          title="Negrita"
        >
          <Bold className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
          onClick={() => execCommand("italic")}
          title="Cursiva"
        >
          <Italic className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <div className="w-px h-5 bg-neutral-300 mx-0.5" />
        <button
          type="button"
          className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
          onClick={() => execCommand("insertUnorderedList")}
          title="Lista con viñetas"
        >
          <List className="w-3.5 h-3.5 text-slate-600" />
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
          className={`min-h-[150px] p-3 text-sm focus:outline-none relative z-10 rich-text-editor`}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          } as any}
          suppressContentEditableWarning
        />
        {/* Placeholder overlay - solo se muestra cuando está vacío y no tiene focus */}
        {isEmpty && isMounted && !isFocused && (
          <div
            className="absolute top-3 left-3 text-slate-400 pointer-events-none z-0 text-sm"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {placeholder}
          </div>
        )}
      </div>
      
    </div>
  );
}