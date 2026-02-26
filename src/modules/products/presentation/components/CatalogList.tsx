import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useState } from "react";

interface CatalogItem {
  id: number;
  name: string;
}

interface CatalogListProps {
  items: CatalogItem[];
  title: string;
  onAdd: (name: string) => Promise<CatalogItem>;
  onEdit: (id: number, name: string) => Promise<CatalogItem>;
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
  className?: string;
}

export const CatalogList: React.FC<CatalogListProps> = ({
  items,
  title,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
  className = "",
}) => {
  const [newItemName, setNewItemName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setIsAdding(true);
    try {
      await onAdd(newItemName.trim());
      setNewItemName("");
    } catch (error) {
      console.error("Error al agregar:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      await onEdit(id, editingName.trim());
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(`¿Estás seguro de eliminar este ${title.toLowerCase()}?`)
    ) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error al eleiminar:", error);
      }
    }
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className={className}>
      {/* Formulario para agregar nuevo */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={`Nuevo ${title.toLowerCase()}...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              disabled={isLoading || isAdding}
            />
          </div>
          <Button
            type="submit"
            isLoading={isAdding}
            disabled={!newItemName.trim()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
        </div>
      </form>

      {/* Lista de items */}
      {isLoading && items.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-neutral-600">Cargando...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">
            No hay {title.toLowerCase()} registrados
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {editingId === item.id ? (
                <>
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button
                    variant="primary"
                    className="text-sm"
                    onClick={() => handleEdit(item.id)}
                    disabled={!editingName.trim()}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="font-medium text-neutral-900">
                      {item.name}
                    </span>
                    <span className="ml-2 text-xs text-neutral-500">
                      ID: {item.id}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={() => startEdit(item)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-sm text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
