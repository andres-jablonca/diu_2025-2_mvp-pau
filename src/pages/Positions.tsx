import { useState, useMemo, useEffect } from "react";
import { mockPositions } from "@/data/positions";
import { Position, PositionCategory } from "@/types/position";
import PositionCard from "@/components/PositionCard";
import ApplicationModal from "@/components/ApplicationModal";
import MyApplications from "@/components/MyApplications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, GraduationCap } from "lucide-react";

const Positions = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const departments = useMemo(() => {
    const depts = Array.from(new Set(mockPositions.map((p) => p.department)));
    return depts.sort();
  }, []);

  const categories: PositionCategory[] = ["cátedra", "corrección", "laboratorio"];

  const filteredPositions = useMemo(() => {
    // Si no hay departamento seleccionado, no mostrar nada
    if (!departmentFilter) {
      return [];
    }
    
    return mockPositions.filter((position) => {
      const matchesSearch =
        position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = position.department === departmentFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        (position.categories && position.categories.includes(categoryFilter as PositionCategory));

      const matchesStatus = statusFilter === "all" || position.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesCategory && matchesStatus;
    });
  }, [searchTerm, departmentFilter, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  
  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPositions.slice(startIndex, endIndex);
  }, [filteredPositions, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, categoryFilter, statusFilter]);

  const handleApply = (position: Position) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background ">
      <header className="bg-gradient-to-b from-card via-card/95 to-background border-b border-border sticky top-0 z-10 shadow-lg backdrop-blur-sm ">
        <div className="container mx-auto px-4 py-6 ">
          <div className="flex items-center gap-3 mb-6 max-w-7xl mx-auto">
            <div className="p-3 bg-primary/15 rounded-xl shadow-sm ">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PAU - Ayudantías</h1>
              <p className="text-sm text-muted-foreground">Plataforma de Ayudantías Unificadas</p>
            </div>
          </div>
          
          <Tabs defaultValue="positions" className="w-full max-w-7xl mx-auto">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="positions">Ayudantías Disponibles</TabsTrigger>
              <TabsTrigger value="applications">Mis Postulaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-6 space-y-6">
              <div className="bg-card backdrop-blur-sm rounded-xl p-6 border-2 border-border shadow-lg space-y-4 max-w-7xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nombre o departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-base"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Filtros:</span>

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[220px] h-10 border-2">
                      <SelectValue placeholder="Seleccione departamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px] h-10 border-2">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-10 border-2">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="open">Abiertas</SelectItem>
                      <SelectItem value="closed">Cerradas</SelectItem>
                    </SelectContent>
                  </Select>

                  {(departmentFilter || categoryFilter !== "all" || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDepartmentFilter("");
                        setCategoryFilter("all");
                        setStatusFilter("all");
                        setCurrentPage(1);
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>

              <div className="pb-8 space-y-6 ">
                {!departmentFilter ? (
                  <div className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-border max-w-6xl mx-auto px">
                    <p className="text-lg text-muted-foreground font-medium">
                      Seleccione un departamento para ver las ayudantías correspondientes
                    </p>
                  </div>
                ) : filteredPositions.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">
                      No se encontraron ayudantías con los filtros seleccionados
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto bg-card border-2 border-border rounded-xl shadow-lg max-w-6xl mx-auto px">
                      <table className="w-full">
                        <thead className="bg-green-600 text-white border-b-2 border-green-800">

                          <tr>
                            <th className="text-left p-4 font-semibold text-white">Ayudantía</th>
                            <th className="text-left p-4 font-semibold text-white">Categorías</th>
                            <th className="text-left p-4 font-semibold text-white">Estado</th>
                            <th className="text-center p-4 font-semibold text-white">Postulantes</th>
                            <th className="text-center p-4 font-semibold text-white">Cupos</th>
                            <th className="text-center p-4 font-semibold text-white">Aceptados</th>
                            <th className="text-center p-4 font-semibold text-white">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPositions.map((position, index) => (
                            <tr 
                              key={position.id}
                              className={`border-b border-border hover:bg-muted/30 transition-colors ${
                                index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                              }`}
                            >
                              <td className="p-4">
                                <div>
                                  <h3 className="font-semibold text-foreground mb-1">{position.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{position.description}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                {position.categories && position.categories.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {position.categories.map((category) => (
                                      <Badge
                                        key={category}
                                        variant="outline"
                                        className="capitalize text-xs self-start"
                                      >
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={position.status === "open" ? "default" : "secondary"}
                                  className={`${position.status === "open" ? "bg-success hover:bg-success" : ""}`}
                                >
                                  {position.status === "open" ? "Abierta" : "Cerrada"}
                                </Badge>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm font-medium text-foreground">{position.currentApplicants}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm font-medium text-foreground">{position.availableSlots}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm font-medium text-foreground">{position.acceptedApplicants}</span>
                              </td>
                              <td className="p-4 text-center">
                                <Button
                                  onClick={() => handleApply(position)}
                                  disabled={position.status !== "open"}
                                  size="sm"
                                  variant={position.status === "open" ? "default" : "secondary"}
                                >
                                  {position.status === "open" ? "Postular" : "No Disponible"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border max-w-5xl mx-auto w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="min-w-[100px] font-medium"
                        >
                          Anterior
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 font-medium ${
                                  currentPage === pageNum ? "shadow-md" : ""
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="min-w-[100px] font-medium"
                        >
                          Siguiente
                        </Button>
                        
                        <div className="text-sm text-muted-foreground font-medium sm:ml-4 text-center sm:text-left">
                          Página {currentPage} de {totalPages}
                          <span className="block sm:inline sm:ml-1">
                            ({filteredPositions.length} {filteredPositions.length === 1 ? "ayudantía" : "ayudantías"})
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              <div className="pb-8">
                <MyApplications />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </header>

      <ApplicationModal
        position={selectedPosition}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPosition(null);
        }}
      />
    </div>
  );
};

export default Positions;
