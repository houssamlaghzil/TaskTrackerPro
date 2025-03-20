import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function DonationForm() {
  const [amount, setAmount] = useState<number>(5);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: amount
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le paiement",
        variant: "destructive",
      });
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

export default function DonatePage() {
  return (
    <div className="container mx-auto max-w-md p-4">
      <Card className="p-6 card-fantasy">
        <h1 className="text-2xl font-bold mb-6 gaming-header text-center">
          Faire un don
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Soutenez notre communauté D&D en faisant un don. Chaque contribution nous aide à améliorer l'expérience de jeu.
        </p>
        <Elements stripe={stripePromise}>
          <DonationForm />
        </Elements>
      </Card>
    </div>
  );
}
