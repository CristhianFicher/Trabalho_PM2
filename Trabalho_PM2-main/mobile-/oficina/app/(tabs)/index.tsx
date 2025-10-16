import { useMemo } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart, ProgressChart } from 'react-native-chart-kit';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { useData } from '@/providers/data-provider';

// Ensure charts fit inside Card without overflowing the rounded corners.
// Subtract ScrollView horizontal padding (20*2) and Card padding (16*2).
const CHART_WIDTH = Dimensions.get('window').width - (20 * 2) - (16 * 2);

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { parts, revisions, clients, suppliers, team } = useData();

  const lowStockCount = useMemo(
    () => parts.filter((part) => part.quantity <= part.minStock).length,
    [parts]
  );

  const stockValue = useMemo(
    () => parts.reduce((total, part) => total + part.quantity * part.unitCost, 0),
    [parts]
  );

  const revisionStatusData = useMemo(() => {
    const base = { agendada: 0, 'em andamento': 0, concluida: 0 } as Record<string, number>;
    revisions.forEach((revision) => {
      base[revision.status] += 1;
    });
    return base;
  }, [revisions]);

  const revisionChartData = useMemo(
    () => ({
      labels: ['Agendadas', 'Em andamento', 'Concluídas'],
      datasets: [
        {
          data: [
            revisionStatusData.agendada,
            revisionStatusData['em andamento'],
            revisionStatusData.concluida,
          ],
        },
      ],
    }),
    [revisionStatusData]
  );

  const teamLoadData = useMemo(() => {
    if (!team.length) {
      return { labels: ['Equipe'], data: [0] };
    }

    const activeRevisions = revisions.reduce<Record<string, number>>((acc, revision) => {
      if (revision.assignedTo) {
        acc[revision.assignedTo] = (acc[revision.assignedTo] ?? 0) + 1;
      }
      return acc;
    }, {});

    const normalized = team.map((member) => activeRevisions[member.id] ?? 0);

    return {
      labels: team.map((member) => member.name.split(' ')[0]),
      data: normalized.length ? normalized.map((value) => Math.min(value / 5, 1)) : [0],
    };
  }, [revisions, team]);

  const quickActions = [
    {
      title: 'Cadastrar nova peça',
      description: 'Atualize o estoque com itens recebidos',
      route: '/(tabs)/parts',
    },
    {
      title: 'Agendar revisão',
      description: 'Defina data, equipe e prioridade',
      route: '/(tabs)/revisions',
    },
    {
      title: 'Adicionar cliente',
      description: 'Mantenha o histórico e canais de contato atualizados',
      route: '/(tabs)/clients',
    },
    {
      title: 'Cadastrar fornecedor',
      description: 'Controle prazos e avaliações de parceiros',
      route: '/(tabs)/suppliers',
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `${colors.accent}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    labelColor: () => colors.text,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      stroke: colors.border,
    },
  } as const;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}>
        <PageHeader
          title="RedCar Oficina"
          subtitle="Painel estratégico de operações e desempenho"
          rightElement={<ThemeToggle />}
        />

        <Card tone="accent" style={styles.heroCard}>
          <ThemedText type="subtitle">Resumo de operações</ThemedText>
          <ThemedText>
            Controle em tempo real das demandas, equipe e relacionamento com clientes.
          </ThemedText>
          <View style={styles.heroMetrics}>
            <View>
              <ThemedText type="title">{revisions.length}</ThemedText>
              <ThemedText type="caption" style={{ color: colors.muted }}>
                Revisões ativas
              </ThemedText>
            </View>
            <View>
              <ThemedText type="title">{parts.length}</ThemedText>
              <ThemedText type="caption" style={{ color: colors.muted }}>
                Peças catalogadas
              </ThemedText>
            </View>
            <View>
              <ThemedText type="title">{clients.length}</ThemedText>
              <ThemedText type="caption" style={{ color: colors.muted }}>
                Clientes ativos
              </ThemedText>
            </View>
          </View>
          <Button title="Ver agenda" onPress={() => router.navigate('/(tabs)/revisions')} />
        </Card>

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <ThemedText type="subtitle">Estoque em risco</ThemedText>
            <ThemedText type="title">{lowStockCount}</ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Itens abaixo do mínimo
            </ThemedText>
          </Card>
          <Card style={styles.metricCard}>
            <ThemedText type="subtitle">Valor estimado</ThemedText>
            <ThemedText type="title">R$ {stockValue.toFixed(0)}</ThemedText>
            <ThemedText type="caption" style={{ color: colors.muted }}>
              Inventário contabilizado
            </ThemedText>
          </Card>
        </View>

        <Card>
          <ThemedText type="subtitle">Status das revisões</ThemedText>
          <BarChart
            data={revisionChartData}
            width={CHART_WIDTH}
            height={220}
            fromZero
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </Card>

        <Card>
          <ThemedText type="subtitle">Carga da equipe</ThemedText>
          <ProgressChart
            data={teamLoadData}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            hideLegend={false}
          />
          <ThemedText type="caption" style={{ color: colors.muted }}>
            Distribuição de revisões por técnico (carga relativa)
          </ThemedText>
        </Card>

        <Card>
          <ThemedText type="subtitle">Ações rápidas</ThemedText>
          <View style={styles.actionsList}>
            {quickActions.map((action) => (
              <View key={action.title} style={styles.actionItem}>
                <View style={styles.actionText}>
                  <ThemedText type="defaultSemiBold">{action.title}</ThemedText>
                  <ThemedText type="caption" style={{ color: colors.muted }}>
                    {action.description}
                  </ThemedText>
                </View>
                <Button
                  title="Abrir"
                  variant="secondary"
                  onPress={() => router.navigate(action.route as never)}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <ThemedText type="subtitle">Parceiros estratégicos</ThemedText>
          {suppliers.slice(0, 3).map((supplier) => (
            <View key={supplier.id} style={styles.supplierRow}>
              <View>
                <ThemedText type="defaultSemiBold">{supplier.company}</ThemedText>
                <ThemedText type="caption" style={{ color: colors.muted }}>
                  {supplier.category} • SLA {supplier.leadTimeDays} dias
                </ThemedText>
              </View>
              <Button
                title="Detalhes"
                variant="ghost"
                onPress={() => router.navigate('/(tabs)/suppliers')}
              />
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  heroCard: {
    gap: 16,
  },
  heroMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    gap: 6,
  },
  chart: {
    borderRadius: 16,
  },
  actionsList: {
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionText: {
    flex: 1,
    gap: 4,
  },
  supplierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
