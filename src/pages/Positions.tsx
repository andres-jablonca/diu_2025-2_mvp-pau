import { useState, useMemo, useEffect } from "react";
import { mockPositions } from "@/data/positions";
import { Position, PositionCategory } from "@/types/position";
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
import { Search, Filter } from "lucide-react";
import { FaSortAlphaUpAlt, FaSortAlphaDown , FaSort, FaSortUp, FaSortDown} from "react-icons/fa";


import { useApplications } from "@/contexts/ApplicationContext";

const Positions = () => {
  const { applications, getAppliedCategories } = useApplications();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
const [sortBy, setSortBy] = useState<"title" | "status">("title");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 7;

  // Contadores de postulantes
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    mockPositions.forEach((pos) => {
      counts[pos.id] = pos.currentApplicants || 0;
    });
    return counts;
  });

  const departments = useMemo(() => {
    const depts = Array.from(new Set(mockPositions.map((p) => p.department)));
    return depts.sort();
  }, []);

  const categories: PositionCategory[] = ["cátedra", "corrección", "laboratorio"];

  const filteredPositions = useMemo(() => {
    if (!departmentFilter) return [];

    let filtered = mockPositions.filter((position) => {
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

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === "title") {
          const cmp = a.title.localeCompare(b.title);
          return sortDirection === "asc" ? cmp : -cmp;
        } else {
          const order = { open: 0, closed: 1 } as const;
          const cmp = order[a.status] - order[b.status];
          return sortDirection === "asc" ? cmp : -cmp;
        }
      });
    }

    return filtered;
  }, [searchTerm, departmentFilter, categoryFilter, statusFilter, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);

  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPositions.slice(startIndex, endIndex);
  }, [filteredPositions, currentPage]);

  const handleSort = (field: "title" | "status") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: "title" ) => {
    if (sortBy !== field)
      return <FaSort className="w-4 h-4 ml-1 inline-block opacity-1" />;
    return sortDirection === "asc" ? (
      <FaSortAlphaDown className="w-4 h-4 ml-1 inline-block" />
    ) : (
      <FaSortAlphaUpAlt className="w-4 h-4 ml-1 inline-block" />
    );
  };

  const getSortIcon2 = (field: "status") => {
    if (sortBy !== field)
      return <FaSort className="w-4 h-4 ml-1 inline-block opacity-1" />;
    return sortDirection === "asc" ? (
      <FaSortDown className="w-4 h-4 ml-1 inline-block" />
    ) : (
      <FaSortUp className="w-4 h-4 ml-1 inline-block" />
    );
  };

  // Reset page al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, categoryFilter, statusFilter, sortBy, sortDirection]);

  // Actualizar contadores cuando cambian las aplicaciones
  useEffect(() => {
    const counts: Record<string, number> = {};
    mockPositions.forEach((pos) => {
      const baseCount = pos.currentApplicants || 0;
      const userApplications = applications.filter(
        (app) => app.positionId === pos.id && app.status === "pending"
      ).length;
      counts[pos.id] = baseCount + userApplications;
    });
    setApplicantCounts(counts);
  }, [applications]);

  const handleApply = (position: Position) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleApplicationSuccess = () => {};

  const getButtonContent = (position: Position) => {
    if (position.status !== "open") return "No Disponible";

    const appliedCategories = getAppliedCategories(position.id);
    const availableCategories = position.categories || [];
    if (availableCategories.length > 0 && appliedCategories.length === availableCategories.length) {
      return "Ya postulaste";
    }
    return "Postular";
  };

  const isAppliedToAll = (position: Position) => {
    if (position.status !== "open") return true;
    const appliedCategories = getAppliedCategories(position.id);
    const availableCategories = position.categories || [];
    return availableCategories.length > 0 && appliedCategories.length === availableCategories.length;
  };

  return (
    <div className="min-h-screen bg-background ">
      <header className="bg-gradient-to-b from-card via-card/95 to-background border-b border-border sticky top-0 z-10 shadow-lg backdrop-blur-sm ">
        <div className="container mx-auto px-8 py-6 ">
          <div className="flex items-center gap-3 mb-6 max-w-7xl mx-auto">
            <div className="p-3 bg-primary/10 mr-3 rounded-xl shadow-sm ">
              <img className="w-8 h-8 text-primary" src="/Logo_UTFSM.png" />
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nombre de asignatura (habiendo seleccionado departamento) . . ."
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
                      <SelectItem value="open">Postulaciones Abiertas</SelectItem>
                      <SelectItem value="closed">Postulaciones Cerradas</SelectItem>
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
                  <div className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-border max-w-6xl mx-auto">
                    <p className="text-lg text-muted-foreground font-medium">
                      Seleccione un departamento para ver las ayudantías correspondientes.
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
                    <div className="overflow-x-auto bg-card border-2 border-border rounded-xl shadow-lg max-w-6xl mx-auto">
                      <table className="w-full border-collapse border border-border/40">
                        <colgroup>
                          <col style={{ width: "40%" }} /> 
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "10%" }} /> 
                          <col style={{ width: "10%" }} /> 
                          <col style={{ width: "8%" }} />  
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "12%" }} /> 
                        </colgroup>

                        <thead className="bg-green-600 text-white border-b-2 border-green-800">
                          <tr className="h-10">
                            <th className="text-left px-3 py-2 border border-green-700 font-semibold align-middle">
                              <button onClick={() => handleSort("title")} className="flex items-center hover:opacity-80 w-full">
                                Asignatura {getSortIcon("title")}
                              </button>
                            </th>
                            <th className="text-center px-3 py-2 border border-green-700 font-semibold align-middle">
                              Tipo de ayudantía
                            </th>
                            <th className="text-center px-3 py-2 border border-green-700 font-semibold align-middle">
                              <button onClick={() => handleSort("status")} className="flex items-center justify-center hover:opacity-80 w-full">
                                Estado {getSortIcon2("status")}
                              </button>
                            </th>
                            <th className="text-center px-3 py-2 border border-green-700 font-semibold align-middle">
                              Postulaciones
                            </th>
                            <th className="text-center px-3 py-2 border border-green-700 font-semibold align-middle">
                              Cupos totales
                            </th>
                            <th className="text-center px-3 py-2 border border-green-700 font-semibold align-middle">
                              Aceptadas
                            </th>
                            <th className="text-center px-3 py-2 border border-green-700 font-semibold align-middle">
                              Acción
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {paginatedPositions.map((position, index) => (
                            <tr
                              key={position.id}
                              className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/10"} align-middle`}
                            >
                              <td className="p-4 border border-border/100 align-middle">
                                <div className="max-w-full">
                                  <h3 className="font-semibold text-foreground mb-1 break-words line-clamp-2">
                                    {position.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground break-words line-clamp-2 leading-snug">
                                    {position.description}
                                  </p>
                                </div>
                              </td>

                              <td className="px-2  border border-border/100 align-middle">
                                {position.categories?.length ? (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    {position.categories.map((category) => (
                                      <Badge 
                                        key={category} 
                                        variant="outline" 
                                        className="capitalize text-xs text-center break-words max-w-full"
                                      >
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </td>

                              <td className="px-2  border border-border/100 text-center align-middle">
                                <div className="flex justify-center">
                                  <Badge
                                    variant={position.status === "open" ? "default" : "secondary"}
                                    className={position.status === "open" ? "bg-success hover:bg-success" : ""}
                                  >
                                    {position.status === "open" ? "Postulaciones Abiertas" : "Postulaciones Cerradas"}
                                  </Badge>
                                </div>
                              </td>

                              <td className="px-2  border border-border/100 text-center align-middle">
                                <span className="text-sm font-medium text-foreground">
                                  {applicantCounts[position.id] || position.currentApplicants}
                                </span>
                              </td>

                              <td className="px-2  border border-border/100 text-center align-middle">
                                <span className="text-sm font-medium text-foreground">{position.availableSlots}</span>
                              </td>

                              <td className="px-2  border border-border/100 text-center align-middle">
                                <span className="text-sm font-medium text-foreground">{position.acceptedApplicants}</span>
                              </td>

                              <td className="px-2  border border-border/100 text-center align-middle">
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() => handleApply(position)}
                                    disabled={isAppliedToAll(position) || position.status !== "open"}
                                    size="sm"
                                    className="w-full max-w-[120px] min-w-[100px] whitespace-normal break-words min-h-[2.5rem] text-center"
                                    variant={position.status === "open" && !isAppliedToAll(position) ? "default" : "secondary"}
                                  >
                                    <span className="text-xs leading-tight px-1">
                                      {position.status !== "open" ? "No disponible" : 
                                       isAppliedToAll(position) ? "Ya postulaste" : "Postular"}
                                    </span>
                                  </Button>
                                </div>
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
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                                className={`w-10 h-10 font-medium ${currentPage === pageNum ? "shadow-md" : ""}`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="min-w-[100px] font-medium"
                        >
                          Siguiente
                        </Button>

                        <div className="text-sm text-muted-foreground font-medium sm:ml-4 text-center sm:text-left">
                          Página {currentPage} de {totalPages}
                          <span className="block sm:inline sm:ml-1">
                            ({filteredPositions.length}{" "}
                            {filteredPositions.length === 1 ? "ayudantía" : "ayudantías"})
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
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
};

export default Positions;


