import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AddressAutocomplete({ onSelect, defaultValue = '', placeholder = "Rechercher une adresse..." }) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([]);
      return;
    }

    const searchAddress = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5&addressdetails=1`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchAddress();
  }, [debouncedQuery]);

  const handleSelect = (result) => {
    setQuery(result.display_name);
    setResults([]);
    onSelect({
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      
      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/50 last:border-0"
            >
              <p className="font-medium truncate">{r.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
