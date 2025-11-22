import { useState, useEffect } from 'react';
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
  icon: any;
  category: 'Prime Member' | 'Associate Member';
  key: string;
}

export const useMemberships = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      console.log('Fetching memberships...');
      const { data, error } = await supabase
        .from('form_categories')
        .select('*')
        .eq('is_active', true)
        .order('position');

      console.log('Raw query result:', { data, error });

      if (error) {
        console.error('Error fetching memberships:', error);
        setMemberships([]);
        return;
      }

      console.log('Memberships fetched successfully:', data);
      
      const formatted: Membership[] = (data || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        description: cat.description,
        price: Number(cat.price),
        icon: iconMap[cat.type] || Building2,
        category: isPrimeMembership(cat.name) ? 'Prime Member' : 'Associate Member',
        key: cat.type,
      }));

      console.log('Formatted memberships:', formatted);
      setMemberships(formatted);
    } catch (error) {
      console.error('Caught error fetching memberships:', error);
      setMemberships([]);
    }
  };

  return { memberships, refetch: fetchMemberships };
};

// Helper function to determine if membership is prime
const isPrimeMembership = (title: string): boolean => {
  const primeTitles = ['institutional', 'proprietor'];
  return primeTitles.some(prime => title.toLowerCase().includes(prime));
};
