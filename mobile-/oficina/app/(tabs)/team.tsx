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
import { TeamMember, TeamRole, ExpertiseLevel } from '@/types/entities';

const roleDisplay: Record<TeamRole, string> = {
  Mecanico: 'Mecânico',
  Eletricista: 'Eletricista',
  Diagnostico: 'Diagnóstico',
  Pintor: 'Pintor',
  Atendimento: 'Atendimento',
};

const expertiseDisplay: Record<ExpertiseLevel, string> = {
  Junior: 'Júnior',
  Pleno: 'Pleno',
  Senior: 'Sênior',
};

const teamSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  role: yup.mixed<TeamRole>().oneOf(['Mecanico', 'Eletricista', 'Diagnostico', 'Pintor', 'Atendimento']).required(),
  phone: yup.string().required('Informe o telefone'),
  email: yup.string().email('E-mail inválido').required('Informe o e-mail'),
  expertiseLevel: yup.mixed<ExpertiseLevel>().oneOf(['Junior', 'Pleno', 'Senior']).required(),
  certificationExpiry: yup.string().required('Informe o vencimento'),
  hiredAt: yup.string().required('Informe a data de contratação'),
  active: yup.boolean().default(true),
});

type TeamFormValues = {
  name: string;
  role: TeamRole;
  phone: string;
  email: string;
  expertiseLevel: ExpertiseLevel;
  certificationExpiry: string;
  hiredAt: string;
  active: boolean;
};

const defaultValues: TeamFormValues = {
  name: '',
  role: 'Mecanico',
  phone: '',
  email: '',
  expertiseLevel: 'Junior',
  certificationExpiry: '',
  hiredAt: '',
  active: true,
};

export default function TeamScreen() {
  const { colors } = useAppTheme();
  const { team, createTeamMember, updateTeamMember, deleteTeamMember } = useData();

  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({
    defaultValues,
    resolver: yupResolver(teamSchema),
  });

  const filteredTeam = useMemo(() => {
    if (!search.trim()) {
      return team;
    }
    const term = search.toLowerCase();
    return team.filter((member) =>
      [member.name, member.role, member.email]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [team, search]);

  const openCreateModal = () => {
    setEditingMember(null);
    reset(defaultValues);
    setIsModalVisible(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    reset({
      name: member.name,
      role: member.role,
      phone: member.phone,
      email: member.email,
      expertiseLevel: member.expertiseLevel,
      certificationExpiry: member.certificationExpiry,
      hiredAt: member.hiredAt,
      active: member.active,
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingMember(null);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = {
      name: formValues.name.trim(),
      role: formValues.role,
      phone: formValues.phone,
      email: formValues.email.trim().toLowerCase(),
      expertiseLevel: formValues.expertiseLevel,
      certificationExpiry: formValues.certificationExpiry,
      hiredAt: formValues.hiredAt,
      active: formValues.active,
    } as Omit<TeamMember, 'id'>;

    if (editingMember) {
      await updateTeamMember(editingMember.id, payload);
    } else {
      await createTeamMember(payload);
    }
    closeModal();
  });

  const confirmDelete = (member: TeamMember) => {
    Alert.alert(
      'Remover colaborador',
      `Confirmar desligamento de ${member.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteTeamMember(member.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <FlatList
        data={filteredTeam}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageHeader
              title="Equipe técnica"
              subtitle="Gerencie habilidades, certificações e disponibilidade"
              rightElement={<ThemeToggle />}
            />
            <Card>
              <TextField
                label="Buscar colaborador"
                placeholder="Nome, função, e-mail..."
                value={search}
                onChangeText={setSearch}
              />
              <Button title="Adicionar colaborador" onPress={openCreateModal} />
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View>
                <ThemedText type="subtitle">{item.name}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  {roleDisplay[item.role]} • {expertiseDisplay[item.expertiseLevel]}
                </ThemedText>
              </View>
              <View style={styles.memberActions}>
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
              {item.email} • {item.phone}
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Certificação vence em {new Date(item.certificationExpiry).toLocaleDateString('pt-BR')}
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Contratado em {new Date(item.hiredAt).toLocaleDateString('pt-BR')} •{' '}
              {item.active ? 'Ativo' : 'Inativo'}
            </ThemedText>
          </Card>
        )}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListEmptyComponent={
          <ThemedText type="caption" style={{ color: colors.muted, textAlign: 'center' }}>
            Nenhum colaborador encontrado.
          </ThemedText>
        }
      />

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}> 
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingMember ? 'Editar colaborador' : 'Adicionar colaborador'}
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
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Função
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label={roleDisplay.Mecanico} value="Mecanico" />
                        <Picker.Item label={roleDisplay.Eletricista} value="Eletricista" />
                        <Picker.Item label={roleDisplay.Diagnostico} value="Diagnostico" />
                        <Picker.Item label={roleDisplay.Pintor} value="Pintor" />
                        <Picker.Item label={roleDisplay.Atendimento} value="Atendimento" />
                      </Picker>
                    </View>
                    {errors.role?.message ? (
                      <ThemedText type="caption" style={{ color: colors.destructive }}>
                        {errors.role.message}
                      </ThemedText>
                    ) : null}
                  </View>
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
                    placeholder="email@empresa.com"
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
                name="expertiseLevel"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Nível de expertise
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label={expertiseDisplay.Junior} value="Junior" />
                        <Picker.Item label={expertiseDisplay.Pleno} value="Pleno" />
                        <Picker.Item label={expertiseDisplay.Senior} value="Senior" />
                      </Picker>
                    </View>
                    {errors.expertiseLevel?.message ? (
                      <ThemedText type="caption" style={{ color: colors.destructive }}>
                        {errors.expertiseLevel.message}
                      </ThemedText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="certificationExpiry"
                render={({ field: { onChange, value } }) => (
                  <DateField
                    label="Certificação válida até"
                    value={value}
                    onChange={onChange}
                    minimumDate={new Date()}
                  />
                )}
              />

              <Controller
                control={control}
                name="hiredAt"
                render={({ field: { onChange, value } }) => (
                  <DateField label="Data de contratação" value={value} onChange={onChange} />
                )}
              />

              <Controller
                control={control}
                name="active"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.switchRow}>
                    <ThemedText type="defaultSemiBold">Ativo na operação</ThemedText>
                    <Switch value={value} onValueChange={onChange} />
                  </View>
                )}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="ghost" onPress={closeModal} />
              <Button title={editingMember ? 'Atualizar' : 'Cadastrar'} onPress={onSubmit} />
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
  memberCard: {
    gap: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberActions: {
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
