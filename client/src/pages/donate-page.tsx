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

// Composant pour le formulaire de paiement Stripe
function PaymentForm({ clientSecret }: { clientSecret: string }) {
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

// Composant principal pour le processus de don
function DonationForm() {
  const [amount, setAmount] = useState<number>(5);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: amount
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

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
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

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm clientSecret={clientSecret} />
    </Elements>
  );
}

export default function DonatePage() {
  const [location] = useLocation();

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
          Faire un don
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Soutenez notre communauté D&D en faisant un don. Chaque contribution nous aide à améliorer l'expérience de jeu.
        </p>
        <DonationForm />
      </Card>
    </div>
  );
}