import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import atendenteImage from "@/assets/atendente-chat.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const calloutMessages = [
  {
    title: "Olá! Sou da Target 👋",
    text: "Quer descobrir como podemos impulsionar seu negócio? Clique para conversar!"
  },
  {
    title: "Resultados Reais 🎯",
    text: "Descubra como geramos mais clientes e vendas para empresas como a sua!"
  },
  {
    title: "Consultoria Gratuita 💡",
    text: "Agende 30 minutos e veja como transformar seu marketing!"
  },
  {
    title: "Está precisando de + clientes? 📈",
    text: "Converse comigo e descubra estratégias personalizadas!"
  }
];

const SdrChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou o assistente virtual da Target. Como posso te ajudar hoje? Para começar, qual é o seu nome?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMessageFading, setIsMessageFading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !leadId) {
      createLead();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setIsMessageFading(true);
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % calloutMessages.length);
          setIsMessageFading(false);
        }, 300);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const createLead = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([{ conversation_data: JSON.stringify(messages) }])
        .select()
        .single();

      if (error) throw error;
      setLeadId(data.id);
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sdr-chat", {
        body: {
          messages: [...messages, userMessage],
          leadId,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      // Check if response contains WhatsApp link placeholder
      if (data.message.includes("[WHATSAPP_LINK]")) {
        const whatsappMessage = encodeURIComponent(
          "Olá! Gostaria de agendar uma consultoria gratuita de 30 minutos."
        );
        const whatsappLink = `https://wa.me/5511999999999?text=${whatsappMessage}`;
        assistantMessage.content = data.message.replace(
          "[WHATSAPP_LINK]",
          `\n\n[Clique aqui para falar no WhatsApp](${whatsappLink})`
        );
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    const currentMessage = calloutMessages[currentMessageIndex];
    
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4">
        {/* Balão de Chamada */}
        <div className="relative bg-background border-2 border-primary rounded-2xl shadow-2xl p-4 max-w-xs animate-in slide-in-from-right-5 duration-500">
          <div className="absolute -right-2 bottom-8 w-4 h-4 bg-background border-r-2 border-b-2 border-primary transform rotate-45" />
          <div className="flex items-start gap-3">
            <img
              src={atendenteImage}
              alt="Atendente Target"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary"
            />
            <div className={`flex-1 transition-opacity duration-300 ${isMessageFading ? 'opacity-0' : 'opacity-100'}`}>
              <p className="font-semibold text-sm mb-1">{currentMessage.title}</p>
              <p className="text-xs text-muted-foreground">
                {currentMessage.text}
              </p>
            </div>
          </div>
        </div>

        {/* Botão do Chat com Pulse */}
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-110 transition-transform animate-pulse"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
        isMinimized ? "h-16 w-80" : "h-[600px] w-[400px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
        <div className="flex items-center gap-3">
          <img
            src={atendenteImage}
            alt="Atendente Target"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary-foreground"
          />
          <div>
            <h3 className="font-semibold text-sm">Chat Target</h3>
            <p className="text-xs opacity-90">Sempre online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SdrChat;