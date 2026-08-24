import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MessageCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100, { message: "Nome muito longo" }),
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email muito longo" }),
  phone: z.string().trim().min(10, { message: "Telefone inválido" }).max(20, { message: "Telefone inválido" }),
  company: z.string().trim().min(2, { message: "Nome da empresa é obrigatório" }).max(100, { message: "Nome muito longo" }),
  message: z.string().trim().min(10, { message: "Mensagem deve ter no mínimo 10 caracteres" }).max(1000, { message: "Mensagem muito longa" }),
});

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDialog = ({ open, onOpenChange }: ContactDialogProps) => {
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", values);
    setShowActions(true);
    toast({
      title: "Formulário enviado!",
      description: "Escolha como deseja continuar o contato.",
    });
  };

  const handleWhatsApp = () => {
    const formData = form.getValues();
    const message = encodeURIComponent(
      `Olá! Meu nome é ${formData.name} da empresa ${formData.company}.\n\nEmail: ${formData.email}\nTelefone: ${formData.phone}\n\nMensagem: ${formData.message}`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, "_blank");
    onOpenChange(false);
  };

  const handleSchedule = () => {
    // Link do Calendly ou outra ferramenta de agendamento
    window.open("https://calendly.com/target-comunicacoes", "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-foreground">
            {showActions ? "Como prefere continuar?" : "Vamos transformar seu negócio"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {showActions
              ? "Escolha a melhor forma de darmos continuidade ao seu projeto"
              : "Preencha o formulário e descubra como podemos acelerar seus resultados"}
          </DialogDescription>
        </DialogHeader>

        {!showActions ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Nome completo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome"
                        {...field}
                        className="bg-secondary border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        className="bg-secondary border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Telefone/WhatsApp *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        className="bg-secondary border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Empresa *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da sua empresa"
                        {...field}
                        className="bg-secondary border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Conte-nos sobre seu projeto *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva seus objetivos, desafios e o que espera alcançar..."
                        className="min-h-[120px] bg-secondary border-border text-foreground resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6">
                Enviar Solicitação
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 py-6">
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-lg py-6 gap-3"
            >
              <MessageCircle className="w-6 h-6" />
              Continuar no WhatsApp
            </Button>

            <Button
              onClick={handleSchedule}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg py-6 gap-3"
            >
              <Calendar className="w-6 h-6" />
              Agendar Reunião Online
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
