import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Client, Part, Revision, Supplier, TeamMember } from '@/types/entities';

const STORAGE_KEYS = {
  parts: '@redcar/parts',
  revisions: '@redcar/revisions',
  team: '@redcar/team',
  clients: '@redcar/clients',
  suppliers: '@redcar/suppliers',
};

type DataContextValue = {
  isReady: boolean;
  parts: Part[];
  revisions: Revision[];
  team: TeamMember[];
  clients: Client[];
  suppliers: Supplier[];
  createPart: (input: Omit<Part, 'id' | 'updatedAt'>) => Promise<void>;
  updatePart: (id: string, input: Omit<Part, 'id'>) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  createRevision: (input: Omit<Revision, 'id'>) => Promise<void>;
  updateRevision: (id: string, input: Omit<Revision, 'id'>) => Promise<void>;
  deleteRevision: (id: string) => Promise<void>;
  createTeamMember: (input: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (id: string, input: Omit<TeamMember, 'id'>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  createClient: (input: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, input: Omit<Client, 'id'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  createSupplier: (input: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, input: Omit<Supplier, 'id'>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nowIso = () => new Date().toISOString();

const defaultTeam: TeamMember[] = [
  {
    id: generateId(),
    name: 'Renato Albuquerque',
    role: 'Mecanico',
    phone: '(11) 95555-2901',
    email: 'renato.albuquerque@redcar.com',
    active: true,
    expertiseLevel: 'Senior',
    certificationExpiry: new Date(Date.now() + 90 * 86_400_000).toISOString(),
    hiredAt: new Date('2020-03-10').toISOString(),
  },
  {
    id: generateId(),
    name: 'Isabela Monteiro',
    role: 'Diagnostico',
    phone: '(11) 98888-4412',
    email: 'isabela.monteiro@redcar.com',
    active: true,
    expertiseLevel: 'Pleno',
    certificationExpiry: new Date(Date.now() + 45 * 86_400_000).toISOString(),
    hiredAt: new Date('2021-08-22').toISOString(),
  },
];

const defaultParts: Part[] = [
  {
    id: generateId(),
    name: 'Filtro de oleo sintetico',
    code: 'RC-FO-900',
    quantity: 18,
    minStock: 6,
    location: 'Corredor B2',
    supplier: 'Mann-Filter',
    category: 'Mecanica',
    unitCost: 38.9,
    updatedAt: nowIso(),
  },
  {
    id: generateId(),
    name: 'Pastilha de freio ceramica',
    code: 'RC-PF-320',
    quantity: 8,
    minStock: 12,
    location: 'Corredor A1',
    supplier: 'Bosch',
    category: 'Suspensao',
    unitCost: 126.4,
    updatedAt: nowIso(),
  },
];

const defaultRevisions: Revision[] = [
  {
    id: generateId(),
    clientName: 'Juliana Souza',
    clientPhone: '(11) 97123-4001',
    vehicleModel: 'Toyota Corolla 2022',
    licensePlate: 'FRT-1023',
    serviceDescription: 'Revisao de 20.000 km + alinhamento',
    scheduledDate: nowIso(),
    scheduledTime: '14:00',
    status: 'agendada',
    priority: 'media',
    assignedTo: defaultTeam[1]?.id,
    notes: 'Cliente aguarda contato caso haja orcamento adicional.',
    remindersEnabled: true,
  },
  {
    id: generateId(),
    clientName: 'Carlos Henrique',
    clientPhone: '(11) 97211-8899',
    vehicleModel: 'Honda Civic 2020',
    licensePlate: 'HDC-7788',
    serviceDescription: "Troca de correia dentada e bomba d'agua",
    scheduledDate: new Date(Date.now() + 86_400_000).toISOString(),
    scheduledTime: '10:30',
    status: 'em andamento',
    priority: 'alta',
    assignedTo: defaultTeam[0]?.id,
    notes: 'Pecas separadas, aguardar aprovacao para itens extras.',
    remindersEnabled: false,
  },
  {
    id: generateId(),
    clientName: 'Maria Silva',
    clientPhone: '(11) 99999-1234',
    vehicleModel: 'Volkswagen Golf 2021',
    licensePlate: 'MSG-4567',
    serviceDescription: 'Revisao completa + troca de filtros',
    scheduledDate: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    scheduledTime: '09:00',
    status: 'concluida',
    priority: 'baixa',
    assignedTo: defaultTeam[0]?.id,
    notes: 'Servico concluido com sucesso. Cliente satisfeito.',
    remindersEnabled: false,
  },
];

const defaultClients: Client[] = [
  {
    id: generateId(),
    name: 'Fernanda Azevedo',
    phone: '(11) 96330-1200',
    email: 'fernanda.azevedo@email.com',
    vehicle: 'Renault Duster 2019',
    licensePlate: 'FND-8891',
    lastVisit: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    tier: 'Gold',
    preferredAdvisor: defaultTeam[0]?.id,
    active: true,
    notes: 'Prefere agendamentos pela manha.',
  },
  {
    id: generateId(),
    name: 'Tiago Martins',
    phone: '(11) 97700-1122',
    email: 'tiago.martins@email.com',
    vehicle: 'Chevrolet Tracker 2021',
    licensePlate: 'TMX-3211',
    lastVisit: new Date(Date.now() - 75 * 86_400_000).toISOString(),
    tier: 'Standard',
    active: true,
    notes: 'Solicitou orcamento para instalacao de acessorios.',
  },
];

const defaultSuppliers: Supplier[] = [
  {
    id: generateId(),
    company: 'AutoParts Brasil',
    contactName: 'Luciana Reis',
    phone: '(11) 94221-7800',
    email: 'luciana.reis@autoparts.com',
    category: 'Pecas originais',
    leadTimeDays: 3,
    preferred: true,
    rating: 4.8,
    lastOrderDate: new Date(Date.now() - 12 * 86_400_000).toISOString(),
  },
  {
    id: generateId(),
    company: 'PneusMax',
    contactName: 'Eduardo Lima',
    phone: '(11) 93011-9022',
    email: 'eduardo@pneusmax.com',
    category: 'Pneus',
    leadTimeDays: 5,
    preferred: false,
    rating: 4.3,
    lastOrderDate: new Date(Date.now() - 40 * 86_400_000).toISOString(),
  },
];

async function loadCollection<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    console.log(`📂 Carregando ${key}...`);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      console.log(`📝 ${key} não encontrado, usando dados padrão`);
      await AsyncStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw) as T[];
    console.log(`✅ ${key} carregado:`, parsed.length, 'itens');
    return parsed;
  } catch (error) {
    console.error(`❌ Erro ao carregar ${key}:`, error);
    return fallback;
  }
}

async function persistCollection<T>(key: string, value: T[]) {
  try {
    console.log(`💾 Persistindo ${key}:`, value.length, 'itens');
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`✅ ${key} salvo com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${key}:`, error);
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const bootstrap = async () => {
      const [storedParts, storedRevisions, storedTeam, storedClients, storedSuppliers] =
        await Promise.all([
          loadCollection(STORAGE_KEYS.parts, defaultParts),
          loadCollection(STORAGE_KEYS.revisions, defaultRevisions),
          loadCollection(STORAGE_KEYS.team, defaultTeam),
          loadCollection(STORAGE_KEYS.clients, defaultClients),
          loadCollection(STORAGE_KEYS.suppliers, defaultSuppliers),
        ]);

      setParts(storedParts);
      setRevisions(storedRevisions);
      setTeam(storedTeam);
      setClients(storedClients);
      setSuppliers(storedSuppliers);
      setIsReady(true);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (isReady) {
      void persistCollection(STORAGE_KEYS.parts, parts);
    }
  }, [isReady, parts]);

  useEffect(() => {
    if (isReady) {
      console.log('💾 Salvando revisões no AsyncStorage:', revisions.length);
      void persistCollection(STORAGE_KEYS.revisions, revisions);
    }
  }, [isReady, revisions]);

  useEffect(() => {
    if (isReady) {
      void persistCollection(STORAGE_KEYS.team, team);
    }
  }, [isReady, team]);

  useEffect(() => {
    if (isReady) {
      void persistCollection(STORAGE_KEYS.clients, clients);
    }
  }, [isReady, clients]);

  useEffect(() => {
    if (isReady) {
      void persistCollection(STORAGE_KEYS.suppliers, suppliers);
    }
  }, [isReady, suppliers]);

  const createPart = useCallback(async (input: Omit<Part, 'id' | 'updatedAt'>) => {
    setParts((previous) => [
      {
        id: generateId(),
        updatedAt: nowIso(),
        ...input,
      },
      ...previous,
    ]);
  }, []);

  const updatePart = useCallback(async (id: string, input: Omit<Part, 'id'>) => {
    setParts((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              ...input,
              updatedAt: nowIso(),
              id,
            }
          : item
      )
    );
  }, []);

  const deletePart = useCallback(async (id: string) => {
    setParts((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const createRevision = useCallback(async (input: Omit<Revision, 'id'>) => {
    setRevisions((previous) => [
      {
        id: generateId(),
        ...input,
      },
      ...previous,
    ]);
  }, []);

  const updateRevision = useCallback(async (id: string, input: Omit<Revision, 'id'>) => {
    setRevisions((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...input, id } : item))
    );
  }, []);

  const deleteRevision = useCallback(async (id: string) => {
    console.log('🗑️ deleteRevision chamado com ID:', id);
    setRevisions((previous) => {
      const beforeCount = previous.length;
      const filtered = previous.filter((item) => item.id !== id);
      const afterCount = filtered.length;
      console.log('📊 Revisões antes:', beforeCount, 'Depois:', afterCount, 'Removidas:', beforeCount - afterCount);
      return filtered;
    });
  }, []);

  const createTeamMember = useCallback(async (input: Omit<TeamMember, 'id'>) => {
    setTeam((previous) => [
      {
        id: generateId(),
        ...input,
      },
      ...previous,
    ]);
  }, []);

  const updateTeamMember = useCallback(async (id: string, input: Omit<TeamMember, 'id'>) => {
    setTeam((previous) => previous.map((item) => (item.id === id ? { ...item, ...input, id } : item)));
  }, []);

  const deleteTeamMember = useCallback(async (id: string) => {
    setTeam((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const createClient = useCallback(async (input: Omit<Client, 'id'>) => {
    setClients((previous) => [
      {
        id: generateId(),
        ...input,
      },
      ...previous,
    ]);
  }, []);

  const updateClient = useCallback(async (id: string, input: Omit<Client, 'id'>) => {
    setClients((previous) => previous.map((item) => (item.id === id ? { ...item, ...input, id } : item)));
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setClients((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const createSupplier = useCallback(async (input: Omit<Supplier, 'id'>) => {
    setSuppliers((previous) => [
      {
        id: generateId(),
        ...input,
      },
      ...previous,
    ]);
  }, []);

  const updateSupplier = useCallback(async (id: string, input: Omit<Supplier, 'id'>) => {
    setSuppliers((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...input, id } : item))
    );
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    setSuppliers((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      isReady,
      parts,
      revisions,
      team,
      clients,
      suppliers,
      createPart,
      updatePart,
      deletePart,
      createRevision,
      updateRevision,
      deleteRevision,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
      createClient,
      updateClient,
      deleteClient,
      createSupplier,
      updateSupplier,
      deleteSupplier,
    }),
    [
      clients,
      createClient,
      createPart,
      createRevision,
      createSupplier,
      createTeamMember,
      deleteClient,
      deletePart,
      deleteRevision,
      deleteSupplier,
      deleteTeamMember,
      isReady,
      parts,
      revisions,
      suppliers,
      team,
      updateClient,
      updatePart,
      updateRevision,
      updateSupplier,
      updateTeamMember,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

