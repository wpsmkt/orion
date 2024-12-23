import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, People as PeopleIcon, Assignment as AssignmentIcon, Add as AddIcon, Map as MapIcon } from '@mui/icons-material';
import { useState } from 'react';
import Pessoas from './pages/Pessoas';
import Abordagens from './pages/Abordagens';
import NovaAbordagem from './pages/NovaAbordagem';
import DetalhePessoa from './pages/DetalhePessoa';
import DetalheAbordagem from './pages/DetalheAbordagem';
import Mapa from './pages/Mapa';

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Pessoas', icon: <PeopleIcon />, path: '/' },
    { text: 'Abordagens', icon: <AssignmentIcon />, path: '/abordagens' },
    { text: 'Nova Abordagem', icon: <AddIcon />, path: '/nova-abordagem' },
    { text: 'Mapa', icon: <MapIcon />, path: '/mapa' },
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          key={item.text} 
          onClick={() => {
            navigate(item.path);
            setDrawerOpen(false);
          }}
          sx={{ cursor: 'pointer' }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={() => setDrawerOpen(!drawerOpen)}
        sx={{ 
          position: 'fixed', 
          left: 16, 
          top: 16, 
          zIndex: theme.zIndex.drawer + 2,
          backgroundColor: 'white',
          boxShadow: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            top: 0,
            height: '100%',
          },
        }}
      >
        <Box sx={{ height: 64 }} /> {/* Espaço para o AppBar */}
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${240}px)` },
          ml: { sm: `${240}px` },
          mt: 8,
        }}
      >
        <Routes>
          <Route path="/" element={<Pessoas />} />
          <Route path="/abordagens" element={<Abordagens />} />
          <Route path="/nova-abordagem" element={<NovaAbordagem />} />
          <Route path="/pessoa/:id" element={<DetalhePessoa />} />
          <Route path="/abordagem/:id" element={<DetalheAbordagem />} />
          <Route path="/mapa" element={<Mapa />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
