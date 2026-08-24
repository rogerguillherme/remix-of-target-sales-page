import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, leadId } = await req.json();
    
    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages must be a non-empty array");
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const systemPrompt = `Você é um SDR (Sales Development Representative) profissional e amigável da Target, uma agência de marketing.

Seu objetivo é conduzir uma conversa natural e engajadora para:
1. Coletar o nome do lead
2. Perguntar o nome da empresa
3. Descobrir a área de atuação
4. Entender as dores e desafios do negócio
5. Conhecer os objetivos do cliente
6. Saber sobre experiências anteriores com marketing/agências

IMPORTANTE:
- Faça UMA pergunta por vez, nunca várias de uma vez
- Seja conversacional, use emojis moderadamente 😊
- Mostre empatia e interesse genuíno
- Após coletar todas as informações, ofereça agendar uma consultoria gratuita de 30min no WhatsApp
- Use uma linguagem profissional mas acessível
- Não force a venda, foque em entender o cliente

Quando tiver todas as informações necessárias, responda com uma mensagem oferecendo:
"Que ótimo conhecer mais sobre sua empresa! 🎯 

Gostaria de agendar uma consultoria gratuita de 30 minutos comigo no WhatsApp? Vamos discutir soluções específicas para [nome da empresa] e como podemos ajudar você a alcançar seus objetivos.

[WHATSAPP_LINK]"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Save conversation to database
    if (leadId) {
      const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("conversation_data")
        .eq("id", leadId)
        .single();

      if (fetchError) {
        console.error("Error fetching lead:", fetchError);
      } else {
        // Ensure conversation_data is an array
        let conversationData = Array.isArray(lead?.conversation_data) 
          ? [...lead.conversation_data] 
          : [];
        
        // Add new messages
        conversationData = [...conversationData, ...messages, { role: "assistant", content: assistantMessage }];

        const { error: updateError } = await supabase
          .from("leads")
          .update({ conversation_data: conversationData })
          .eq("id", leadId);

        if (updateError) {
          console.error("Error updating lead:", updateError);
        }
      }
    }

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in sdr-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});