import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { stripePromise } from "@/lib/stripe";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Donation } from "@shared/schema";

function PaymentForm({ clientSecret, donorNickname }: { clientSecret: string; donorNickname: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Erreur",
        description: "Le système de paiement n'est pas initialisé",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/success`,
          payment_method_data: {
            metadata: {
              donorNickname,
            },
          },
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full btn-hover"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Confirmer le don
      </Button>
    </form>
  );
}

function DonationForm() {
  const [amount, setAmount] = useState<number>(5);
  const [donorNickname, setDonorNickname] = useState("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    if (!donorNickname.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un pseudonyme",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        donorNickname: donorNickname.trim(),
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le paiement",
        variant: "destructive",
      });
      console.error("Initialize payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm clientSecret={clientSecret} donorNickname={donorNickname} />
      </Elements>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="nickname" className="text-sm font-medium">
          Votre pseudonyme
        </label>
        <Input
          id="nickname"
          value={donorNickname}
          onChange={(e) => setDonorNickname(e.target.value)}
          placeholder="Entrez votre pseudonyme"
          className="input-fantasy"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Montant du don (€)
        </label>
        <Input
          id="amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
          className="input-fantasy"
        />
      </div>
      <Button 
        onClick={initializePayment}
        disabled={isLoading}
        className="w-full btn-hover"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Faire un don de {amount}€
      </Button>
    </div>
  );
}

export default function DonatePage() {
  const [location] = useLocation();

  const { data: topDonation } = useQuery<Donation>({
    queryKey: ["/api/donations/top"],
  });

  // Vérifier si nous sommes sur la page de succès
  if (location === '/donate/success') {
    return (
      <div className="container mx-auto max-w-md p-4">
        <Card className="p-6 card-fantasy">
          <h1 className="text-2xl font-bold mb-6 gaming-header text-center">
            Merci pour votre don !
          </h1>
          <p className="text-muted-foreground mb-6 text-center">
            Votre soutien est très apprécié et nous aide à améliorer l'expérience de jeu pour toute la communauté.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full btn-hover"
          >
            Retourner à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <Card className="p-6 card-fantasy">
        <h1 className="text-2xl font-bold mb-6 gaming-header text-center">
          Soutenir notre communauté
        </h1>
        <div className="prose prose-sm dark:prose-invert mb-8">
          <p>
            Notre service est et restera toujours entièrement gratuit. Les dons sont facultatifs
            et ne donnent aucun avantage particulier. Ils nous permettent simplement de continuer
            à améliorer et maintenir la plateforme pour toute la communauté.
          </p>
          <p>
            Important : Les dons doivent être effectués uniquement par la personne qui paye,
            et seulement si elle en a les moyens. Nous n'encourageons en aucun cas les dons
            au-delà de vos capacités financières.
          </p>
          {topDonation && (
            <p className="text-center font-medium">
              Plus gros don : {topDonation.donorNickname} ({topDonation.amount / 100}€)
            </p>
          )}
        </div>
        <DonationForm />
      </Card>
    </div>
  );
}