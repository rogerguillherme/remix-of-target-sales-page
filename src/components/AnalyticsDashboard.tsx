import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Users, Eye, TrendingUp } from "lucide-react";

interface PageVisit {
  page_path: string;
  count: number;
}

interface AnalyticsData {
  totalVisits: number;
  uniquePages: number;
  topPages: PageVisit[];
  recentVisits: number;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    uniquePages: 0,
    topPages: [],
    recentVisits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Total visits
      const { count: totalVisits, error: totalError } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true });

      if (totalError) throw totalError;

      // Recent visits (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentVisits, error: recentError } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .gte("visited_at", yesterday.toISOString());

      if (recentError) throw recentError;

      // Top pages
      const { data: allVisits, error: visitsError } = await supabase
        .from("page_visits")
        .select("page_path");

      if (visitsError) throw visitsError;

      // Group by page_path
      const pageCount: Record<string, number> = {};
      allVisits?.forEach((visit) => {
        pageCount[visit.page_path] = (pageCount[visit.page_path] || 0) + 1;
      });

      const topPages = Object.entries(pageCount)
        .map(([page_path, count]) => ({ page_path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        totalVisits: totalVisits || 0,
        uniquePages: Object.keys(pageCount).length,
        topPages,
        recentVisits: recentVisits || 0,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando métricas...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisits}</div>
            <p className="text-xs text-muted-foreground">Desde o início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitas Recentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentVisits}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Páginas Únicas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniquePages}</div>
            <p className="text-xs text-muted-foreground">Páginas visitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalVisits > 0
                ? ((analytics.recentVisits / analytics.totalVisits) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Engajamento recente</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas Mais Visitadas</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topPages.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma visita registrada ainda.</p>
          ) : (
            <div className="space-y-4">
              {analytics.topPages.map((page, index) => (
                <div key={page.page_path} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{page.page_path}</p>
                      <p className="text-sm text-muted-foreground">
                        {page.count} {page.count === 1 ? "visita" : "visitas"}
                      </p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(page.count / analytics.topPages[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};