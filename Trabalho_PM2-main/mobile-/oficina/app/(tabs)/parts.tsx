import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { useData } from '@/providers/data-provider';
import { Part } from '@/types/entities';

const categoryDisplay: Record<Part['category'], string> = {
  Mecanica: 'Mecânica',
  Eletrica: 'Elétrica',
  Suspensao: 'Suspensão',
  Lataria: 'Lataria',
  Outros: 'Outros',
};

const partSchema = yup.object({
  name: yup.string().required('Informe a descrição'),
  code: yup.string().required('Informe o código'),
  quantity: yup
    .number()
    .typeError('Quantidade inválida')
    .min(0, 'Mínimo zero')
    .required('Quantidade obrigatória'),
  minStock: yup
    .number()
    .typeError('Estoque mínimo inválido')
    .min(0, 'Mínimo zero')
    .required('Informe o estoque mínimo'),
  location: yup.string().required('Informe a localização'),
  supplier: yup.string().required('Informe o fornecedor'),
  category: yup.mixed<Part['category']>().oneOf(['Mecanica', 'Eletrica', 'Suspensao', 'Lataria', 'Outros']).required(),
  unitCost: yup
    .number()
    .typeError('Valor inválido')
    .min(0, 'Valor inválido')
    .required('Informe o custo unitário'),
});

type PartFormValues = {
  name: string;
  code: string;
  quantity: string;
  minStock: string;
  location: string;
  supplier: string;
  category: Part['category'];
  unitCost: string;
};

const defaultValues: PartFormValues = {
  name: '',
  code: '',
  quantity: '',
  minStock: '',
  location: '',
  supplier: '',
  category: 'Mecanica',
  unitCost: '',
};

export default function PartsScreen() {
  const { colors } = useAppTheme();
  const { parts, createPart, updatePart, deletePart } = useData();

  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartFormValues>({
    defaultValues,
    resolver: yupResolver(partSchema),
  });

  const filteredParts = useMemo(() => {
    if (!search.trim()) {
      return parts;
    }
    const term = search.toLowerCase();
    return parts.filter((part) =>
      [part.name, part.code, part.location, part.supplier, part.category]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [parts, search]);

  const openCreateModal = () => {
    setEditingPart(null);
    reset(defaultValues);
    setIsModalVisible(true);
  };

  const openEditModal = (part: Part) => {
    setEditingPart(part);
    reset({
      name: part.name,
      code: part.code,
      quantity: String(part.quantity),
      minStock: String(part.minStock),
      location: part.location,
      supplier: part.supplier,
      category: part.category,
      unitCost: String(part.unitCost),
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingPart(null);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = {
      name: formValues.name.trim(),
      code: formValues.code.trim().toUpperCase(),
      quantity: Number(formValues.quantity),
      minStock: Number(formValues.minStock),
      location: formValues.location.trim(),
      supplier: formValues.supplier.trim(),
      category: formValues.category,
      unitCost: Number(formValues.unitCost),
    };

    if (editingPart) {
      await updatePart(editingPart.id, { ...payload, updatedAt: editingPart.updatedAt });
    } else {
      await createPart(payload);
    }
    closeModal();
  });

  const confirmDelete = (part: Part) => {
    Alert.alert(
      'Remover peça',
      `Confirmar exclusão de ${part.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deletePart(part.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <FlatList
        data={filteredParts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <PageHeader
              title="Peças e estoque"
              subtitle="Cadastre, edite e acompanhe o inventário da RedCar"
              rightElement={<ThemeToggle />}
            />
            <Card>
              <TextField
                label="Busca"
                placeholder="Nome, código, fornecedor..."
                value={search}
                onChangeText={setSearch}
              />
              <Button title="Cadastrar peça" onPress={openCreateModal} />
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.partCard}>
            <View style={styles.partHeader}>
              <View style={styles.partTitle}>
                <ThemedText type="subtitle">{item.name}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  {item.code} • {categoryDisplay[item.category]}
                </ThemedText>
              </View>
              <View style={styles.partActions}>
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

            <View style={styles.partMeta}>
              <View style={styles.badge}>
                <ThemedText type="caption" style={{ color: colors.textSecondary }}>
                  Local: {item.location}
                </ThemedText>
              </View>
              <View style={styles.badge}>
                <ThemedText type="caption" style={{ color: colors.textSecondary }}>
                  Fornecedor: {item.supplier}
                </ThemedText>
              </View>
            </View>

            <View style={styles.partFooter}>
              <View>
                <ThemedText type="subtitle">{item.quantity}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  Disponíveis
                </ThemedText>
              </View>
              <View style={styles.stockStatus}>
                <View
                  style={[
                    styles.stockBadge,
                    {
                      backgroundColor:
                        item.quantity <= item.minStock ? colors.accentSoft : colors.surface,
                      borderColor:
                        item.quantity <= item.minStock ? colors.accent : colors.border,
                    },
                  ]}>
                  <ThemedText
                    type="caption"
                    style={{
                      color: item.quantity <= item.minStock ? colors.accent : colors.textSecondary,
                    }}>
                    Mínimo: {item.minStock}
                  </ThemedText>
                </View>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  Atualizado em {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                </ThemedText>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListEmptyComponent={
          <ThemedText type="caption" style={{ color: colors.muted, textAlign: 'center' }}>
            Nenhuma peça encontrada.
          </ThemedText>
        }
      />

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}> 
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingPart ? 'Editar peça' : 'Cadastrar peça'}
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
                    label="Descrição"
                    placeholder="Ex. Pastilha dianteira"
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Código"
                    placeholder="RC-0001"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={onChange}
                    error={errors.code?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Quantidade"
                    placeholder="0"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    error={errors.quantity?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="minStock"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Estoque mínimo"
                    placeholder="0"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    error={errors.minStock?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Localização"
                    placeholder="Corredor A1"
                    value={value}
                    onChangeText={onChange}
                    error={errors.location?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="supplier"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Fornecedor"
                    placeholder="Ex. Bosch"
                    value={value}
                    onChangeText={onChange}
                    error={errors.supplier?.message}
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
                        <Picker.Item label={categoryDisplay.Mecanica} value="Mecanica" />
                        <Picker.Item label={categoryDisplay.Eletrica} value="Eletrica" />
                        <Picker.Item label={categoryDisplay.Suspensao} value="Suspensao" />
                        <Picker.Item label={categoryDisplay.Lataria} value="Lataria" />
                        <Picker.Item label={categoryDisplay.Outros} value="Outros" />
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
                name="unitCost"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="Custo unitário"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    error={errors.unitCost?.message}
                  />
                )}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="ghost" onPress={closeModal} />
              <Button title={editingPart ? 'Atualizar' : 'Cadastrar'} onPress={onSubmit} />
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
    paddingBottom: 100,
    gap: 16,
  },
  headerContainer: {
    gap: 20,
    marginBottom: 16,
  },
  partCard: {
    gap: 16,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  partTitle: {
    flex: 1,
    gap: 4,
  },
  partActions: {
    flexDirection: 'row',
    gap: 12,
  },
  partMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  partFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stockStatus: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stockBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    gap: 16,
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
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
