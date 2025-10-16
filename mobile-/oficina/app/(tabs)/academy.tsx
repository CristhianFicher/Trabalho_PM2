import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';

type Article = {
  id: number;
  title: string;
  body: string;
};

const learningTracks = [
  {
    id: 'track-1',
    title: 'Diagnóstico eletrônico avançado',
    description: 'Interpretação de códigos OBD-II, uso do scanner e testes em sensores.',
    progress: 0.65,
    duration: '6h de conteúdo',
    lastAccess: 'há 3 dias',
  },
  {
    id: 'track-2',
    title: 'Sistemas de freio com ADAS',
    description: 'Boas práticas para calibração, sangria eletrônica e atualização de software.',
    progress: 0.4,
    duration: '4h de conteúdo',
    lastAccess: 'há 1 semana',
  },
  {
    id: 'track-3',
    title: 'Motores turbo de nova geração',
    description: 'Fluxo de inspeção, ajustes finos e análise de dados telemétricos.',
    progress: 0.2,
    duration: '8h de conteúdo',
    lastAccess: 'há 2 semanas',
  },
];

const knowledgeBase = [
  {
    id: 'doc-1',
    title: 'Checklist RedCar de revisão completa',
    category: 'Guias práticos',
    updatedAt: 'Atualizado há 10 dias',
  },
  {
    id: 'doc-2',
    title: 'Tabela de torque para motores 1.0 a 2.0',
    category: 'Materiais de referência',
    updatedAt: 'Atualizado há 3 dias',
  },
  {
    id: 'doc-3',
    title: 'Protocolos de segurança em alta tensão (veículos híbridos)',
    category: 'Segurança',
    updatedAt: 'Atualizado há 1 mês',
  },
];

const certifications = [
  {
    id: 'cert-1',
    title: 'Treinamento RedCar em powertrain híbrido',
    date: '15/04/2025',
    status: 'Inscrições abertas',
  },
  {
    id: 'cert-2',
    title: 'Workshop presencial: sistemas ADAS',
    date: '26/04/2025',
    status: 'Vagas limitadas',
  },
];

export default function AcademyScreen() {
  const { colors, isDark } = useAppTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        setArticlesError(null);
        const response = await axios.get<Article[]>(
          'https://jsonplaceholder.typicode.com/posts',
          {
            params: { _limit: 3 },
            timeout: 8000,
          }
        );
        setArticles(response.data);
      } catch {
        setArticlesError('Não foi possível carregar novidades técnicas no momento.');
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Central de estudos"
          subtitle="Mantenha a equipe RedCar atualizada com materiais estratégicos"
          rightElement={<ThemeToggle />}
        />

        <Card tone="accent">
          <ThemedText type="subtitle">Trilhas em andamento</ThemedText>
          <ThemedText type="caption" style={{ color: colors.muted }}>
            Continue de onde parou ou distribua as lições para os novos colaboradores.
          </ThemedText>

          <View style={styles.trackList}>
            {learningTracks.map((track) => (
              <View key={track.id} style={[styles.trackItem, { borderColor: colors.border }]}> 
                <View style={styles.trackHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.trackTitle} numberOfLines={2}>
                    {track.title}
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.trackMetadata, { color: colors.muted }]}>
                    {track.duration}
                  </ThemedText>
                </View>
                <ThemedText type="caption" style={{ color: colors.textSecondary }} numberOfLines={3}>
                  {track.description}
                </ThemedText>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : colors.accentSoft },
                  ]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.accent,
                        width: `${track.progress * 100}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.trackFooter}>
                  <ThemedText type="caption" style={{ color: colors.muted }}>
                    Último acesso: {track.lastAccess}
                  </ThemedText>
                  <Button title="Continuar" variant="secondary" onPress={() => {}} style={styles.inlineButton} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <ThemedText type="subtitle">Novidades do setor</ThemedText>
          {articlesLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : articlesError ? (
            <ThemedText type="caption" style={{ color: colors.destructive }}>
              {articlesError}
            </ThemedText>
          ) : (
            <View style={styles.articleList}>
              {articles.map((article) => (
                <View key={article.id} style={[styles.articleItem, { borderColor: colors.border }]}> 
                  <ThemedText type="defaultSemiBold" numberOfLines={2}>
                    {article.title}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: colors.muted }} numberOfLines={3}>
                    {article.body}
                  </ThemedText>
                  <Button title="Ler mais" variant="ghost" onPress={() => {}} style={styles.inlineButton} />
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <ThemedText type="subtitle">Base de conhecimento</ThemedText>
          <View style={styles.knowledgeList}>
            {knowledgeBase.map((material) => (
              <View key={material.id} style={styles.knowledgeItem}>
                <View style={styles.knowledgeText}>
                  <ThemedText type="defaultSemiBold" numberOfLines={2}>
                    {material.title}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: colors.muted }}>
                    {material.category} • {material.updatedAt}
                  </ThemedText>
                </View>
                <Button title="Abrir" variant="secondary" onPress={() => {}} style={styles.inlineButton} />
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <ThemedText type="subtitle">Certificações e eventos</ThemedText>
          <View style={styles.certList}>
            {certifications.map((cert) => (
              <View key={cert.id} style={[styles.certItem, { borderColor: colors.border }]}> 
                <View style={styles.certHeader}>
                  <ThemedText type="defaultSemiBold" numberOfLines={2}>
                    {cert.title}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: colors.muted }}>
                    {cert.date}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.accentSoft }]}> 
                  <ThemedText type="caption" style={{ color: colors.accent }}>
                    {cert.status}
                  </ThemedText>
                </View>
                <Button title="Inscrever equipe" onPress={() => {}} style={styles.inlineButton} />
              </View>
            ))}
          </View>
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
  trackList: {
    gap: 16,
    paddingTop: 12,
  },
  trackItem: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  trackTitle: {
    flex: 1,
  },
  trackMetadata: {
    flexShrink: 0,
    textAlign: 'right',
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  trackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  loader: {
    marginTop: 12,
  },
  articleList: {
    gap: 16,
  },
  articleItem: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  knowledgeList: {
    gap: 16,
  },
  knowledgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  knowledgeText: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  certList: {
    gap: 16,
  },
  certItem: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  certHeader: {
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
