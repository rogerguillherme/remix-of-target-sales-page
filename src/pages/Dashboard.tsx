import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Users, TrendingUp, Calendar } from "lucide-react";
import { PixelConfig } from "@/components/PixelConfig";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

interface Lead {
  id: string;
  name: string | null;
  company_name: string | null;
  business_area: string | null;
  pain_points: string | null;
  objectives: string | null;
  previous_experience: string | null;
  conversation_data: string | null;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchLeads();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Erro ao carregar leads",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-green-500",
      converted: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard de Leads</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Métricas</TabsTrigger>
            <TabsTrigger value="pixels">Pixels</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leads.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos (24h)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter((lead) => {
                      const dayAgo = new Date();
                      dayAgo.setDate(dayAgo.getDate() - 1);
                      return new Date(lead.created_at) > dayAgo;
                    }).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter((lead) => lead.status === "qualified").length}
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Leads List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lista de Leads</h2>
            {leads.map((lead) => (
              <Card
                key={lead.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedLead(lead)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {lead.name || "Sem nome"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lead.company_name || "Empresa não informada"}
                      </p>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {lead.business_area && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Área:</span> {lead.business_area}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lead Detail */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Detalhes do Lead</h2>
            {selectedLead ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedLead.name || "Sem nome"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Informações</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Empresa:</span>{" "}
                        {selectedLead.company_name || "Não informada"}
                      </p>
                      <p>
                        <span className="font-medium">Área:</span>{" "}
                        {selectedLead.business_area || "Não informada"}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge className={getStatusColor(selectedLead.status)}>
                          {selectedLead.status}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  {selectedLead.pain_points && (
                    <div>
                      <h4 className="font-semibold mb-2">Dores</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedLead.pain_points}
                      </p>
                    </div>
                  )}

                  {selectedLead.objectives && (
                    <div>
                      <h4 className="font-semibold mb-2">Objetivos</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedLead.objectives}
                      </p>
                    </div>
                  )}

                  {selectedLead.conversation_data && (
                    <div>
                      <h4 className="font-semibold mb-2">Conversa</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(() => {
                          try {
                            const messages = JSON.parse(selectedLead.conversation_data);
                            return messages.map((msg: any, idx: number) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg text-sm ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground ml-8"
                                    : "bg-muted mr-8"
                                }`}
                              >
                                <p className="font-medium mb-1">
                                  {msg.role === "user" ? "Cliente" : "SDR"}
                                </p>
                                <p>{msg.content}</p>
                              </div>
                            ));
                          } catch {
                            return <p className="text-sm text-muted-foreground">Sem conversa registrada</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Selecione um lead para ver os detalhes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsDashboard />
      </TabsContent>

      <TabsContent value="pixels">
        <PixelConfig />
      </TabsContent>
    </Tabs>
  </div>
</div>

  );
};

export default Dashboard;