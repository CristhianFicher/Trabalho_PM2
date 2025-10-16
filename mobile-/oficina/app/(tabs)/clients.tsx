import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateField } from '@/components/ui/date-field';
import { MaskedTextField } from '@/components/ui/masked-input';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { useData } from '@/providers/data-provider';
import { Client, ClientTier } from '@/types/entities';

const tierDisplay: Record<ClientTier, string> = {
  Standard: 'Standard',
  Gold: 'Gold',
  Platinum: 'Platinum',
};

const clientSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  phone: yup.string().required('Informe o telefone'),
  email: yup.string().email('E-mail invalido').required('Informe o e-mail'),
  vehicle: yup.string().required('Informe o vei­culo'),
  licensePlate: yup.string().required('Informe a placa'),
  lastVisit: yup.string().required('Informe a Ultima visita'),
  tier: yup.mixed<ClientTier>().oneOf(['Standard', 'Gold', 'Platinum']).required(),
  preferredAdvisor: yup.string().nullable(),
  active: yup.boolean().default(true),
  notes: yup.string().nullable(),
});

type ClientFormValues = {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  licensePlate: string;
  lastVisit: string;
  tier: ClientTier;
  preferredAdvisor: string;
  active: boolean;
  notes: string;
};

const defaultValues: ClientFormValues = {
  name: '',
  phone: '',
  email: '',
  vehicle: '',
  licensePlate: '',
  lastVisit: '',
  tier: 'Standard',
  preferredAdvisor: '',
  active: true,
  notes: '',
};

export default function ClientsScreen() {
  const { colors } = useAppTheme();
  const { clients, team, createClient, updateClient, deleteClient } = useData();

  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    defaultValues,
    resolver: yupResolver(clientSchema),
  });

  const filteredClients = useMemo(() => {
    if (!search.trim()) {
      return clients;
    }
    const term = search.toLowerCase();
    return clients.filter((client) =>
      [client.name, client.email, client.phone, client.vehicle]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [clients, search]);

  const openCreateModal = () => {
    setEditingClient(null);
    reset(defaultValues);
    setIsModalVisible(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    reset({
      name: client.name,
      phone: client.phone,
      email: client.email,
      vehicle: client.vehicle,
      licensePlate: client.licensePlate,
      lastVisit: client.lastVisit,
      tier: client.tier,
      preferredAdvisor: client.preferredAdvisor ?? '',
      active: client.active,
      notes: client.notes ?? '',
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingClient(null);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = {
      name: formValues.name.trim(),
      phone: formValues.phone,
      email: formValues.email.trim().toLowerCase(),
      vehicle: formValues.vehicle.trim(),
      licensePlate: formValues.licensePlate.toUpperCase(),
      lastVisit: formValues.lastVisit,
      tier: formValues.tier,
      preferredAdvisor: formValues.preferredAdvisor ? formValues.preferredAdvisor : undefined,
      active: formValues.active,
      notes: formValues.notes.trim() || undefined,
    } as Omit<Client, 'id'>;

    if (editingClient) {
      await updateClient(editingClient.id, payload);
    } else {
      await createClient(payload);
    }
    closeModal();
  });

  const confirmDelete = (client: Client) => {
    Alert.alert(
      'Remover cliente',
      `Deseja remover ${client.name} do cadastro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteClient(client.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageHeader
              title="Clientes"
              subtitle="Controle o relacionamento e dados veiculares"
              rightElement={<ThemeToggle />}
            />
            <Card>
              <TextField
                label="Buscar cliente"
                placeholder="Nome, telefone, placa..."
                value={search}
                onChangeText={setSearch}
              />
              <Button title="Cadastrar cliente" onPress={openCreateModal} />
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <View>
                <ThemedText type="subtitle">{item.name}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  {item.vehicle} {item.licensePlate}
                </ThemedText>
              </View>
              <View style={styles.clientActions}>
                <Pressable onPress={() => openEditModal(item)}>
                  <ThemedText type="caption" style={{ color: colors.accent }}>
                    Editar
                  </ThemedText>
                </Pressable>
                <Pressable onPress={() => confirmDelete(item)}>
                  <ThemedText type="caption" style={{ color: colors.destructive }}>
                    Excluir
                  </ThemedText>
                </Pressable>
              </View>
            </View>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              {item.email} {item.phone}
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Ultima visita: {new Date(item.lastVisit).toLocaleDateString('pt-BR')} {tierDisplay[item.tier]}
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Status: {item.active ? 'Ativo' : 'Inativo'}
            </ThemedText>
          </Card>
        )}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListEmptyComponent={
          <ThemedText type="caption" style={{ color: colors.muted, textAlign: 'center' }}>
            Nenhum cliente cadastrado.
          </ThemedText>
        }
      />

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}> 
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingClient ? 'Editar cliente' : 'Cadastrar cliente'}
              </ThemedText>
              <Pressable onPress={closeModal}>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  Fechar
                </ThemedText>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Nome"
                    placeholder="Nome completo"
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <MaskedTextField
                    label="Telefone"
                    mask="(99) 99999-9999"
                    placeholder="(00) 00000-0000"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="E-mail"
                    placeholder="email@cliente.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="vehicle"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Veiculo"
                    placeholder="Modelo e ano"
                    value={value}
                    onChangeText={onChange}
                    error={errors.vehicle?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="licensePlate"
                render={({ field: { onChange, value } }) => (
                  <MaskedTextField
                    label="Placa"
                    mask="AAA-0A00"
                    placeholder="AAA-0A00"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={onChange}
                    error={errors.licensePlate?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastVisit"
                render={({ field: { onChange, value } }) => (
                  <DateField label="Ultima visita" value={value} onChange={onChange} />
                )}
              />

              <Controller
                control={control}
                name="tier"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Categoria
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label={tierDisplay.Standard} value="Standard" />
                        <Picker.Item label={tierDisplay.Gold} value="Gold" />
                        <Picker.Item label={tierDisplay.Platinum} value="Platinum" />
                      </Picker>
                    </View>
                    {errors.tier?.message ? (
                      <ThemedText type="caption" style={{ color: colors.destructive }}>
                        {errors.tier.message}
                      </ThemedText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="preferredAdvisor"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Consultor preferido
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label="Não definido" value="" />
                        {team.map((member) => (
                          <Picker.Item key={member.id} label={member.name} value={member.id} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="active"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.switchRow}>
                    <ThemedText type="defaultSemiBold">Cliente ativo</ThemedText>
                    <Switch value={value} onValueChange={onChange} />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Observações"
                    placeholder="Preferências, histórico..."
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="ghost" onPress={closeModal} />
              <Button title={editingClient ? 'Atualizar' : 'Cadastrar'} onPress={onSubmit} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    gap: 16,
  },
  headerContainer: {
    gap: 16,
    marginBottom: 20,
  },
  clientCard: {
    gap: 10,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    gap: 18,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  form: {
    gap: 14,
    paddingBottom: 16,
  },
  pickerWrapper: {
    gap: 6,
  },
  pickerLabel: {
    fontSize: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});



