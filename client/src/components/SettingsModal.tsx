import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({
  open,
  onOpenChange
}: SettingsModalProps) {
  const { settings, updateSetting } = useSettings();

  const handleDefaultRadiusChange = (value: string) => {
    updateSetting('defaultRadius', parseInt(value));
  };

  const handleDefaultViewChange = (value: string) => {
    updateSetting('defaultView', value as 'map' | 'list');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader className="border-b border-neutral pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-medium">Settings</DialogTitle>
            <DialogClose className="text-neutral-dark hover:text-neutral-darkest focus:outline-none">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Accessibility</h3>
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="high-contrast" className="flex items-center cursor-pointer">
                <span>High Contrast Mode</span>
              </Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrastMode}
                onCheckedChange={(checked) => updateSetting('highContrastMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="larger-text" className="flex items-center cursor-pointer">
                <span>Larger Text</span>
              </Label>
              <Switch
                id="larger-text"
                checked={settings.largerTextMode}
                onCheckedChange={(checked) => updateSetting('largerTextMode', checked)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Default Settings</h3>
            <div className="mb-3">
              <Label htmlFor="default-radius" className="block text-sm mb-1">Default Search Radius</Label>
              <Select
                value={settings.defaultRadius.toString()}
                onValueChange={handleDefaultRadiusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="15">15 miles</SelectItem>
                  <SelectItem value="20">20 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="30">30 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="default-view" className="block text-sm mb-1">Default View</Label>
              <Select
                value={settings.defaultView}
                onValueChange={handleDefaultViewChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Map</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-sm text-neutral-darkest">TowGo v1.0</p>
            <p className="text-sm text-neutral-dark mt-1">© 2025 TowGo. All rights reserved.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
