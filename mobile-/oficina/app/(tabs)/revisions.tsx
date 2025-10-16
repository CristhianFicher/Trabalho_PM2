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
import { Revision, RevisionPriority, RevisionStatus } from '@/types/entities';

const statusDisplay: Record<RevisionStatus, string> = {
  agendada: 'Agendada',
  'em andamento': 'Em andamento',
  concluida: 'Concluida',
};

const priorityDisplay: Record<RevisionPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baixa: 'Baixa',
};

const revisionSchema = yup.object({
  clientName: yup.string().required('Informe o cliente'),
  clientPhone: yup.string().required('Informe o telefone'),
  vehicleModel: yup.string().required('Informe o veiculo'),
  licensePlate: yup.string().required('Informe a placa'),
  serviceDescription: yup.string().required('Descreva o servico'),
  scheduledDate: yup.string().required('Selecione a data'),
  scheduledTime: yup.string().required('Selecione o horario'),
  status: yup.mixed<RevisionStatus>().oneOf(['agendada', 'em andamento', 'concluida']).required(),
  priority: yup.mixed<RevisionPriority>().oneOf(['alta', 'media', 'baixa']).required(),
  assignedTo: yup.string().nullable(),
  notes: yup.string().nullable(),
  remindersEnabled: yup.boolean().default(false),
});

type RevisionFormValues = {
  clientName: string;
  clientPhone: string;
  vehicleModel: string;
  licensePlate: string;
  serviceDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  status: RevisionStatus;
  priority: RevisionPriority;
  assignedTo: string;
  notes: string;
  remindersEnabled: boolean;
};

const defaultValues: RevisionFormValues = {
  clientName: '',
  clientPhone: '',
  vehicleModel: '',
  licensePlate: '',
  serviceDescription: '',
  scheduledDate: '',
  scheduledTime: '',
  status: 'agendada',
  priority: 'media',
  assignedTo: '',
  notes: '',
  remindersEnabled: true,
};

const statusFilters: { key: RevisionStatus | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'agendada', label: statusDisplay.agendada },
  { key: 'em andamento', label: statusDisplay['em andamento'] },
  { key: 'concluida', label: statusDisplay.concluida },
];

export default function RevisionsScreen() {
  const { colors } = useAppTheme();
  const { revisions, team, createRevision, updateRevision, deleteRevision } = useData();
  
  console.log('🔄 RevisionsScreen renderizado com', revisions.length, 'revisões');

  const [statusFilter, setStatusFilter] = useState<RevisionStatus | 'todas'>('todas');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRevision, setEditingRevision] = useState<Revision | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevisionFormValues>({
    defaultValues,
    resolver: yupResolver(revisionSchema),
  });

  const filteredRevisions = useMemo(() => {
    if (statusFilter === 'todas') {
      return revisions;
    }
    return revisions.filter((revision) => revision.status === statusFilter);
  }, [revisions, statusFilter]);

  const counts = useMemo(() => {
    const reducer = revisions.reduce(
      (acc, revision) => {
        acc.total += 1;
        acc[revision.status] += 1;
        return acc;
      },
      { total: 0, agendada: 0, 'em andamento': 0, concluida: 0 }
    );
    return reducer;
  }, [revisions]);

  const openCreateModal = () => {
    setEditingRevision(null);
    reset(defaultValues);
    setIsModalVisible(true);
  };

  const openEditModal = (revision: Revision) => {
    setEditingRevision(revision);
    reset({
      clientName: revision.clientName,
      clientPhone: revision.clientPhone,
      vehicleModel: revision.vehicleModel,
      licensePlate: revision.licensePlate,
      serviceDescription: revision.serviceDescription,
      scheduledDate: revision.scheduledDate,
      scheduledTime: revision.scheduledTime,
      status: revision.status,
      priority: revision.priority,
      assignedTo: revision.assignedTo ?? '',
      notes: revision.notes ?? '',
      remindersEnabled: revision.remindersEnabled,
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingRevision(null);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = {
      clientName: formValues.clientName.trim(),
      clientPhone: formValues.clientPhone,
      vehicleModel: formValues.vehicleModel.trim(),
      licensePlate: formValues.licensePlate.toUpperCase(),
      serviceDescription: formValues.serviceDescription.trim(),
      scheduledDate: formValues.scheduledDate,
      scheduledTime: formValues.scheduledTime,
      status: formValues.status,
      priority: formValues.priority,
      assignedTo: formValues.assignedTo ? formValues.assignedTo : undefined,
      notes: formValues.notes.trim() || undefined,
      remindersEnabled: formValues.remindersEnabled,
    } as Omit<Revision, 'id'>;

    if (editingRevision) {
      await updateRevision(editingRevision.id, payload);
    } else {
      await createRevision(payload);
    }
    closeModal();
  });

  const confirmDelete = (revision: Revision) => {
    console.log('🔍 confirmDelete chamado para:', revision.clientName, 'ID:', revision.id);
    
    // Teste simples primeiro - deletar diretamente sem Alert
    console.log('🧪 Testando exclusão direta...');
    deleteRevision(revision.id);
    
    // Alert.alert(
    //   'Cancelar revisao',
    //   `Deseja cancelar a revisao de ${revision.clientName}?`,
    //   [
    //     { text: 'Manter', style: 'cancel' },
    //     { 
    //       text: 'Cancelar', 
    //       style: 'destructive', 
    //       onPress: () => {
    //         console.log('✅ Usuário confirmou exclusão da revisão:', revision.id);
    //         deleteRevision(revision.id);
    //       }
    //     },
    //   ]
    // );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <FlatList
        data={filteredRevisions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageHeader
              title="Agenda de revisoes"
              subtitle="Distribua e acompanhe cada atendimento"
              rightElement={<ThemeToggle />}
            />
            <Card tone="accent" style={styles.formCard}>
              <ThemedText type="subtitle">Agendar nova revisao</ThemedText>
              <ThemedText type="caption" style={{ color: colors.muted }}>
                Informe cliente, veiculo, prioridade e responsavel.
              </ThemedText>
              <Button title="Nova revisao" onPress={openCreateModal} />
            </Card>
            <Card>
              <ThemedText type="subtitle">Visao por status</ThemedText>
              <View style={styles.filtersRow}>
                {statusFilters.map((filter) => {
                  const labelCount =
                    filter.key === 'todas'
                      ? counts.total
                      : counts[filter.key as RevisionStatus];
                  return (
                    <Button
                      key={filter.key}
                      title={`${filter.label} (${labelCount})`}
                      variant={statusFilter === filter.key ? 'primary' : 'secondary'}
                      onPress={() => setStatusFilter(filter.key)}
                    />
                  );
                })}
              </View>
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.revisionCard}>
            <View style={styles.revisionHeader}>
              <View style={styles.revisionTitle}>
                <ThemedText type="subtitle">{item.clientName}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  {item.vehicleModel}
                </ThemedText>
              </View>
              <View style={styles.chipRow}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'concluida'
                          ? colors.success
                          : item.status === 'em andamento'
                          ? colors.accent
                          : colors.accentSoft,
                    },
                  ]}>
                  <ThemedText
                    type="caption"
                    style={{ color: item.status === 'agendada' ? colors.accent : '#ffffff' }}>
                    {statusDisplay[item.status]}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.accentSoft }]}> 
                  <ThemedText type="caption" style={{ color: colors.accent }}>
                    {priorityDisplay[item.priority]}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.scheduleRow}>
              <ThemedText type="defaultSemiBold">
                {new Date(item.scheduledDate).toLocaleDateString('pt-BR')} as {item.scheduledTime}
              </ThemedText>
              <ThemedText type="caption" style={{ color: colors.muted }}>
                {item.clientPhone} • {item.licensePlate}
              </ThemedText>
            </View>

            {item.notes ? (
              <ThemedText type="caption" style={{ color: colors.muted }}>
                {item.notes}
              </ThemedText>
            ) : null}

            <View style={styles.revisionActions}>
              <Button title="Editar" variant="secondary" onPress={() => openEditModal(item)} />
              {item.status !== 'concluida' && (
                <Button
                  title="Concluir"
                  onPress={() => {
                    const { id, ...rest } = item;
                    void updateRevision(id, { ...rest, status: 'concluida' });
                  }}
                />
              )}
              <Button 
                title="Cancelar" 
                variant="ghost" 
                onPress={() => {
                  console.log('🖱️ Botão Cancelar clicado para:', item.clientName);
                  confirmDelete(item);
                }} 
              />
            </View>
          </Card>
        )}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListEmptyComponent={
          <ThemedText type="caption" style={{ color: colors.muted, textAlign: 'center' }}>
            Nenhuma revisao encontrada.
          </ThemedText>
        }
      />

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}> 
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingRevision ? 'Editar revisao' : 'Agendar revisao'}
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
                name="clientName"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Cliente"
                    placeholder="Nome completo"
                    value={value}
                    onChangeText={onChange}
                    error={errors.clientName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="clientPhone"
                render={({ field: { onChange, value } }) => (
                  <MaskedTextField
                    label="Telefone"
                    mask="(99) 99999-9999"
                    placeholder="(00) 00000-0000"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    error={errors.clientPhone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="vehicleModel"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Veiculo"
                    placeholder="Modelo e ano"
                    value={value}
                    onChangeText={onChange}
                    error={errors.vehicleModel?.message}
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
                name="serviceDescription"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Servico"
                    placeholder="Detalhe o que sera feito"
                    value={value}
                    onChangeText={onChange}
                    error={errors.serviceDescription?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="scheduledDate"
                render={({ field: { onChange, value } }) => (
                  <DateField
                    label="Data"
                    value={value}
                    onChange={onChange}
                    minimumDate={new Date()}
                  />
                )}
              />

              <Controller
                control={control}
                name="scheduledTime"
                render={({ field: { onChange, value } }) => (
                  <DateField label="Horario" value={value} onChange={onChange} mode="time" />
                )}
              />

              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Status
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label={statusDisplay.agendada} value="agendada" />
                        <Picker.Item label={statusDisplay['em andamento']} value="em andamento" />
                        <Picker.Item label={statusDisplay.concluida} value="concluida" />
                      </Picker>
                    </View>
                    {errors.status?.message ? (
                      <ThemedText type="caption" style={{ color: colors.destructive }}>
                        {errors.status.message}
                      </ThemedText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Prioridade
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label={priorityDisplay.alta} value="alta" />
                        <Picker.Item label={priorityDisplay.media} value="media" />
                        <Picker.Item label={priorityDisplay.baixa} value="baixa" />
                      </Picker>
                    </View>
                    {errors.priority?.message ? (
                      <ThemedText type="caption" style={{ color: colors.destructive }}>
                        {errors.priority.message}
                      </ThemedText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="assignedTo"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Tecnico responsavel
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label="Nao definido" value="" />
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
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Observacoes"
                    placeholder="Informacoes adicionais"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="remindersEnabled"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.switchRow}>
                    <ThemedText type="defaultSemiBold">Lembretes por push</ThemedText>
                    <Switch value={value} onValueChange={onChange} />
                  </View>
                )}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="ghost" onPress={closeModal} />
              <Button title={editingRevision ? 'Atualizar' : 'Agendar'} onPress={onSubmit} />
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
  formCard: {
    gap: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revisionCard: {
    gap: 16,
  },
  revisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  revisionTitle: {
    flex: 1,
    gap: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scheduleRow: {
    gap: 6,
  },
  revisionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
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
