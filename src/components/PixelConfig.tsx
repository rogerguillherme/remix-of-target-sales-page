import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface PixelConfig {
  id: string;
  pixel_type: string;
  pixel_id: string;
  is_active: boolean;
}

const PIXEL_TYPES = [
  { value: "facebook", label: "Facebook Pixel" },
  { value: "google_analytics", label: "Google Analytics" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Pixel" },
];

export const PixelConfig = () => {
  const [pixels, setPixels] = useState<PixelConfig[]>([]);
  const [newPixelType, setNewPixelType] = useState("facebook");
  const [newPixelId, setNewPixelId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPixels();
  }, []);

  const fetchPixels = async () => {
    try {
      const { data, error } = await supabase
        .from("pixel_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPixels(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pixels",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addPixel = async () => {
    if (!newPixelId.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o ID do pixel",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("pixel_configs").insert({
        pixel_type: newPixelType,
        pixel_id: newPixelId,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Pixel adicionado!",
        description: "O pixel foi configurado com sucesso.",
      });

      setNewPixelId("");
      fetchPixels();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar pixel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePixel = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("pixel_configs")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Pixel ${!isActive ? "ativado" : "desativado"} com sucesso.`,
      });

      fetchPixels();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePixel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pixel_configs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Pixel removido!",
        description: "O pixel foi removido com sucesso.",
      });

      fetchPixels();
    } catch (error: any) {
      toast({
        title: "Erro ao remover pixel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Pixels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Pixel */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Adicionar Novo Pixel</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pixel-type">Tipo de Pixel</Label>
              <select
                id="pixel-type"
                value={newPixelType}
                onChange={(e) => setNewPixelType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {PIXEL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pixel-id">ID do Pixel</Label>
              <Input
                id="pixel-id"
                value={newPixelId}
                onChange={(e) => setNewPixelId(e.target.value)}
                placeholder="Ex: 1234567890"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addPixel} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Pixels List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Pixels Configurados</h3>
          {pixels.length === 0 ? (
            <p className="text-muted-foreground">Nenhum pixel configurado ainda.</p>
          ) : (
            <div className="space-y-3">
              {pixels.map((pixel) => (
                <div
                  key={pixel.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {PIXEL_TYPES.find((t) => t.value === pixel.pixel_type)?.label ||
                        pixel.pixel_type}
                    </p>
                    <p className="text-sm text-muted-foreground">{pixel.pixel_id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`switch-${pixel.id}`}>
                        {pixel.is_active ? "Ativo" : "Inativo"}
                      </Label>
                      <Switch
                        id={`switch-${pixel.id}`}
                        checked={pixel.is_active}
                        onCheckedChange={() => togglePixel(pixel.id, pixel.is_active)}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deletePixel(pixel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};