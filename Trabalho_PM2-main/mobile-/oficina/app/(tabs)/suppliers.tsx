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
import { Supplier, SupplierCategory } from '@/types/entities';

const categoryDisplay: Record<SupplierCategory, string> = {
  'Pecas originais': 'Peças originais',
  'Pecas paralelas': 'Peças paralelas',
  Pneus: 'Pneus',
  Tintas: 'Tintas',
  'Servicos terceirizados': 'Serviços terceirizados',
};

const supplierSchema = yup.object({
  company: yup.string().required('Informe a empresa'),
  contactName: yup.string().required('Informe o contato'),
  phone: yup.string().required('Informe o telefone'),
  email: yup.string().email('E-mail inválido').required('Informe o e-mail'),
  category: yup
    .mixed<SupplierCategory>()
    .oneOf(['Pecas originais', 'Pecas paralelas', 'Pneus', 'Tintas', 'Servicos terceirizados'])
    .required(),
  leadTimeDays: yup
    .number()
    .typeError('Informe o prazo em dias')
    .min(0)
    .required('Informe o prazo'),
  preferred: yup.boolean().default(false),
  rating: yup
    .number()
    .typeError('Informe a avaliação')
    .min(0)
    .max(5)
    .required('Informe a avaliação'),
  lastOrderDate: yup.string().required('Informe a data do último pedido'),
});

type SupplierFormValues = {
  company: string;
  contactName: string;
  phone: string;
  email: string;
  category: SupplierCategory;
  leadTimeDays: string;
  preferred: boolean;
  rating: string;
  lastOrderDate: string;
};

const defaultValues: SupplierFormValues = {
  company: '',
  contactName: '',
  phone: '',
  email: '',
  category: 'Pecas originais',
  leadTimeDays: '',
  preferred: false,
  rating: '4.0',
  lastOrderDate: '',
};

export default function SuppliersScreen() {
  const { colors } = useAppTheme();
  const { suppliers, createSupplier, updateSupplier, deleteSupplier } = useData();

  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    defaultValues,
    resolver: yupResolver(supplierSchema),
  });

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) {
      return suppliers;
    }
    const term = search.toLowerCase();
    return suppliers.filter((supplier) =>
      [supplier.company, supplier.category, supplier.contactName]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [suppliers, search]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    reset(defaultValues);
    setIsModalVisible(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      company: supplier.company,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email,
      category: supplier.category,
      leadTimeDays: String(supplier.leadTimeDays),
      preferred: supplier.preferred,
      rating: supplier.rating.toFixed(1),
      lastOrderDate: supplier.lastOrderDate,
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = {
      company: formValues.company.trim(),
      contactName: formValues.contactName.trim(),
      phone: formValues.phone,
      email: formValues.email.trim().toLowerCase(),
      category: formValues.category,
      leadTimeDays: Number(formValues.leadTimeDays),
      preferred: formValues.preferred,
      rating: Number(formValues.rating),
      lastOrderDate: formValues.lastOrderDate,
    } as Omit<Supplier, 'id'>;

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, payload);
    } else {
      await createSupplier(payload);
    }
    closeModal();
  });

  const confirmDelete = (supplier: Supplier) => {
    Alert.alert(
      'Remover fornecedor',
      `Deseja remover ${supplier.company}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteSupplier(supplier.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <FlatList
        data={filteredSuppliers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageHeader
              title="Fornecedores"
              subtitle="Monitore prazos, avaliações e relacionamento"
              rightElement={<ThemeToggle />}
            />
            <Card>
              <TextField
                label="Buscar fornecedor"
                placeholder="Nome, categoria..."
                value={search}
                onChangeText={setSearch}
              />
              <Button title="Cadastrar fornecedor" onPress={openCreateModal} />
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.supplierCard}>
            <View style={styles.supplierHeader}>
              <View>
                <ThemedText type="subtitle">{item.company}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  Contato: {item.contactName} • {item.phone}
                </ThemedText>
              </View>
              <View style={styles.supplierActions}>
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
              {categoryDisplay[item.category]} • Prazo médio: {item.leadTimeDays} dias
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Avaliação: {item.rating.toFixed(1)} • Último pedido: {new Date(item.lastOrderDate).toLocaleDateString('pt-BR')}
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Preferencial: {item.preferred ? 'Sim' : 'Não'}
            </ThemedText>
          </Card>
        )}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListEmptyComponent={
          <ThemedText type="caption" style={{ color: colors.muted, textAlign: 'center' }}>
            Nenhum fornecedor cadastrado.
          </ThemedText>
        }
      />

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}> 
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingSupplier ? 'Editar fornecedor' : 'Cadastrar fornecedor'}
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
                name="company"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Empresa"
                    placeholder="Nome fantasia"
                    value={value}
                    onChangeText={onChange}
                    error={errors.company?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="contactName"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Responsável"
                    placeholder="Nome do contato"
                    value={value}
                    onChangeText={onChange}
                    error={errors.contactName?.message}
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
                    placeholder="email@fornecedor.com"
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
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
                      Categoria
                    </ThemedText>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}> 
                      <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label={categoryDisplay['Pecas originais']} value="Pecas originais" />
                        <Picker.Item label={categoryDisplay['Pecas paralelas']} value="Pecas paralelas" />
                        <Picker.Item label={categoryDisplay.Pneus} value="Pneus" />
                        <Picker.Item label={categoryDisplay.Tintas} value="Tintas" />
                        <Picker.Item label={categoryDisplay['Servicos terceirizados']} value="Servicos terceirizados" />
                      </Picker>
                    </View>
                    {errors.category?.message ? (
                      <ThemedText type="caption" style={{ color: colors.destructive }}>
                        {errors.category.message}
                      </ThemedText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="leadTimeDays"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Prazo médio (dias)"
                    placeholder="0"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    error={errors.leadTimeDays?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="rating"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Avaliação"
                    placeholder="0 a 5"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    error={errors.rating?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="preferred"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.switchRow}>
                    <ThemedText type="defaultSemiBold">Fornecedor preferencial</ThemedText>
                    <Switch value={value} onValueChange={onChange} />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="lastOrderDate"
                render={({ field: { onChange, value } }) => (
                  <DateField label="Último pedido" value={value} onChange={onChange} />
                )}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="ghost" onPress={closeModal} />
              <Button title={editingSupplier ? 'Atualizar' : 'Cadastrar'} onPress={onSubmit} />
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
  supplierCard: {
    gap: 10,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supplierActions: {
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
