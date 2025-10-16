export type UUID = string;

export type Part = {
  id: UUID;
  name: string;
  code: string;
  quantity: number;
  minStock: number;
  location: string;
  supplier: string;
  category: 'Mecanica' | 'Eletrica' | 'Suspensao' | 'Lataria' | 'Outros';
  unitCost: number;
  updatedAt: string;
};

export type RevisionStatus = 'agendada' | 'em andamento' | 'concluida';
export type RevisionPriority = 'alta' | 'media' | 'baixa';

export type Revision = {
  id: UUID;
  clientName: string;
  clientPhone: string;
  vehicleModel: string;
  licensePlate: string;
  serviceDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  status: RevisionStatus;
  priority: RevisionPriority;
  assignedTo?: UUID;
  notes?: string;
  remindersEnabled: boolean;
};

export type TeamRole = 'Mecanico' | 'Eletricista' | 'Diagnostico' | 'Pintor' | 'Atendimento';
export type ExpertiseLevel = 'Junior' | 'Pleno' | 'Senior';

export type TeamMember = {
  id: UUID;
  name: string;
  role: TeamRole;
  phone: string;
  email: string;
  active: boolean;
  expertiseLevel: ExpertiseLevel;
  certificationExpiry: string;
  hiredAt: string;
};

export type ClientTier = 'Standard' | 'Gold' | 'Platinum';

export type Client = {
  id: UUID;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  licensePlate: string;
  lastVisit: string;
  tier: ClientTier;
  preferredAdvisor?: UUID;
  active: boolean;
  notes?: string;
};

export type SupplierCategory = 'Pecas originais' | 'Pecas paralelas' | 'Pneus' | 'Tintas' | 'Servicos terceirizados';

export type Supplier = {
  id: UUID;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  category: SupplierCategory;
  leadTimeDays: number;
  preferred: boolean;
  rating: number;
  lastOrderDate: string;
};
