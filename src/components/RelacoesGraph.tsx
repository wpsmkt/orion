import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { 
  Box, 
  Typography, 
  Dialog, 
  Card,
  CardContent,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { getAbordagens } from '../services/supabaseService';
import { Pessoa } from '../types';

interface Node {
  id: string;
  name: string;
  img?: string;
  val: number;
  pessoa: Pessoa;
  level: number; // Nível de relacionamento (0 = principal, 1 = direto, 2 = indireto)
}

interface Link {
  source: string;
  target: string;
  value: number;
  abordagens: string[];
  isIndirect?: boolean; // Se é uma relação indireta
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface Props {
  pessoa: Pessoa;
  open: boolean;
  onClose: () => void;
}

export default function RelacoesGraph({ pessoa, open, onClose }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [graphWidth, setGraphWidth] = useState(window.innerWidth);
  const [graphHeight, setGraphHeight] = useState(window.innerHeight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setGraphWidth(window.innerWidth);
      setGraphHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!open || !pessoa) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const abordagens = await getAbordagens();
        const nodes = new Map<string, Node>();
        const links = new Map<string, { value: number, abordagens: string[], isIndirect?: boolean }>();
        const processedPeople = new Set<string>();

        // Função para processar as relações de uma pessoa
        const processRelations = (pessoaAtual: Pessoa, level: number) => {
          if (processedPeople.has(pessoaAtual.id) || level > 2) return;
          processedPeople.add(pessoaAtual.id);

          // Adiciona ou atualiza o nó
          if (!nodes.has(pessoaAtual.id)) {
            nodes.set(pessoaAtual.id, {
              id: pessoaAtual.id,
              name: pessoaAtual.nome || 'Nome não informado',
              img: pessoaAtual.fotoPerfil,
              val: level === 0 ? 20 : level === 1 ? 15 : 10,
              pessoa: pessoaAtual,
              level
            });
          }

          // Processa todas as abordagens desta pessoa
          abordagens.forEach(abordagem => {
            if (abordagem.pessoas.some(p => p.id === pessoaAtual.id)) {
              abordagem.pessoas.forEach(outraPessoa => {
                if (outraPessoa.id !== pessoaAtual.id) {
                  // Cria ou atualiza o link
                  const linkId = [pessoaAtual.id, outraPessoa.id].sort().join('-');
                  const linkData = links.get(linkId) || { value: 0, abordagens: [], isIndirect: level > 0 };
                  linkData.value += 1;
                  if (!linkData.abordagens.includes(abordagem.id)) {
                    linkData.abordagens.push(abordagem.id);
                  }
                  links.set(linkId, linkData);

                  // Processa as relações da outra pessoa (nível + 1)
                  if (level < 2) {
                    processRelations(outraPessoa, level + 1);
                  }
                }
              });
            }
          });
        };

        // Começa o processamento pela pessoa principal
        processRelations(pessoa, 0);

        // Converte os links para o formato esperado
        const graphLinks = Array.from(links.entries()).map(([id, data]) => {
          const [source, target] = id.split('-');
          return { 
            source, 
            target, 
            value: data.value,
            abordagens: data.abordagens,
            isIndirect: data.isIndirect
          };
        });

        setGraphData({
          nodes: Array.from(nodes.values()),
          links: graphLinks
        });
      } catch (error) {
        console.error('Erro ao carregar dados do grafo:', error);
        setError('Erro ao carregar dados das relações');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pessoa, open]);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNavigateToPerson = (nodeId: string) => {
    navigate(`/pessoa/${nodeId}`);
    onClose();
  };

  const getNodeColor = (node: Node) => {
    switch (node.level) {
      case 0: return '#ff6b6b'; // Pessoa principal
      case 1: return '#4dabf5'; // Relação direta
      case 2: return '#69f0ae'; // Relação indireta
      default: return '#666';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          bgcolor: '#1a1a1a',
          position: 'relative'
        }
      }}
    >
      <Box sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Rede de Relações - {pessoa?.nome || 'Nome não informado'}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip 
                size="small"
                sx={{ bgcolor: '#ff6b6b', color: 'white' }}
                label="Pessoa Selecionada"
              />
              <Chip 
                size="small"
                sx={{ bgcolor: '#4dabf5', color: 'white' }}
                label="Relação Direta"
              />
              <Chip 
                size="small"
                sx={{ bgcolor: '#69f0ae', color: 'white' }}
                label="Relação Indireta"
              />
            </Box>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flex: 1,
          gap: 2
        }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, width: '100%' }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <>
              {/* Graph */}
              <Box sx={{ 
                flex: 1,
                height: isMobile ? '50vh' : '100%',
                bgcolor: '#1a1a1a',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <ForceGraph2D
                  graphData={graphData}
                  nodeLabel="name"
                  nodeRelSize={6}
                  width={isMobile ? graphWidth - 32 : (graphWidth * 0.6)}
                  height={isMobile ? (graphHeight * 0.4) : (graphHeight * 0.8)}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const size = node.val;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                    ctx.fillStyle = getNodeColor(node);
                    ctx.fill();

                    const label = node.name;
                    const fontSize = 12/globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'white';
                    ctx.fillText(label, node.x, node.y + size + fontSize);
                  }}
                  linkWidth={link => (link as any).value}
                  linkColor={link => (link as any).isIndirect ? '#69f0ae44' : '#4dabf544'}
                  onNodeClick={handleNodeClick}
                  cooldownTicks={100}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleWidth={2}
                />
              </Box>

              {/* Selected Node Info */}
              {selectedNode && (
                <Card sx={{ 
                  width: isMobile ? '100%' : 300,
                  bgcolor: '#2a2a2a',
                  color: 'white',
                  alignSelf: 'flex-start'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={selectedNode.img}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          mr: 2,
                          bgcolor: getNodeColor(selectedNode)
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {selectedNode.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'grey.400' }}>
                          {selectedNode.level === 0 
                            ? 'Pessoa Selecionada'
                            : selectedNode.level === 1
                              ? 'Relação Direta'
                              : 'Relação Indireta'
                          }
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleNavigateToPerson(selectedNode.id)}
                      sx={{ mt: 2 }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Box>
      </Box>
    </Dialog>
  );
} 