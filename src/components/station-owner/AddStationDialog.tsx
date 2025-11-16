import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface AddStationDialogProps {
  onStationAdded?: () => void;
}

export function AddStationDialog({ onStationAdded }: AddStationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    power_kw: "",
    base_price_per_kwh: "",
    auto_pricing_on: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('station-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('station-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Insert station
      const { error } = await supabase.from('stations').insert({
        owner_id: user.id,
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        power_kw: parseFloat(formData.power_kw),
        base_price_per_kwh: parseFloat(formData.base_price_per_kwh),
        auto_pricing_on: formData.auto_pricing_on,
        photo_url: photoUrl,
        status: 'active',
      });

      if (error) throw error;

      toast.success("Station créée avec succès");
      setOpen(false);
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        power_kw: "",
        base_price_per_kwh: "",
        auto_pricing_on: false,
      });
      setPhotoFile(null);
      onStationAdded?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle station
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une station</DialogTitle>
          <DialogDescription>
            Remplissez les informations de votre nouvelle borne de recharge
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nom de la station *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Station République"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="5 Place de la République, 75003 Paris"
              />
            </div>

            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="48.8676"
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="2.3634"
              />
            </div>

            <div>
              <Label htmlFor="power_kw">Puissance (kW) *</Label>
              <Input
                id="power_kw"
                type="number"
                step="0.1"
                required
                value={formData.power_kw}
                onChange={(e) => setFormData({ ...formData, power_kw: e.target.value })}
                placeholder="22"
              />
            </div>

            <div>
              <Label htmlFor="base_price">Prix de base (€/kWh) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                required
                value={formData.base_price_per_kwh}
                onChange={(e) => setFormData({ ...formData, base_price_per_kwh: e.target.value })}
                placeholder="0.35"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="photo">Photo de la station</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-pricing">Auto-pricing dynamique</Label>
                <p className="text-sm text-muted-foreground">
                  Ajuster automatiquement les prix selon la demande
                </p>
              </div>
              <Switch
                id="auto-pricing"
                checked={formData.auto_pricing_on}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, auto_pricing_on: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer la station"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
