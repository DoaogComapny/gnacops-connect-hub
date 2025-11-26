import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  Wrench,
  UserCog,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  institutional: Building2,
  proprietor: Briefcase,
  teacher: GraduationCap,
  parent: Users,
  service_provider: Wrench,
  non_teaching_staff: UserCog,
};

interface Membership {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price: number;
  secondary_price: number | null;
  secondary_price_label: string | null;
  icon: any;
  category: 'Prime Member' | 'Associate Member';
  key: string;
}

// Helper function to determine if membership is prime
const isPrimeMembership = (title: string): boolean => {
  const primeTitles = ['institutional', 'proprietor'];
  return primeTitles.some(prime => title.toLowerCase().includes(prime));
};

export const useMemberships = () => {
  const { data: memberships = [], refetch } = useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_categories')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) {
        console.error('Error fetching memberships:', error);
        return [];
      }
      
      const formatted: Membership[] = (data || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        description: cat.description,
        price: Number(cat.price),
        secondary_price: cat.secondary_price ? Number(cat.secondary_price) : null,
        secondary_price_label: cat.secondary_price_label,
        icon: iconMap[cat.type] || Building2,
        category: isPrimeMembership(cat.name) ? 'Prime Member' : 'Associate Member',
        key: cat.type,
      }));

      return formatted;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - memberships rarely change
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
  });

  return { memberships, refetch };
};
