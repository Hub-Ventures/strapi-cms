import React from 'react';
import { Box, Typography, Grid, Flex } from '@strapi/design-system';
import { Pencil, PaintBrush, Image } from '@strapi/icons';
import { useNavigate } from 'react-router-dom';

const PAGE_UID = encodeURIComponent('api::page.page');
const THEME_UID = encodeURIComponent('api::theme.theme');

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Crear Nueva Página',
      description: 'Añade una nueva página a tu sitio web.',
      icon: <Pencil />,
      to: `/content-manager/collection-types/${PAGE_UID}/create`,
      color: 'primary600'
    },
    {
      label: 'Media Library',
      description: 'Sube y gestiona imágenes y archivos.',
      icon: <Image />,
      to: '/plugins/upload',
      color: 'secondary600'
    },
    {
      label: 'Personalizar Tema',
      description: 'Ajusta colores y tipografía del sitio.',
      icon: <PaintBrush />,
      // Assuming singleton or collection type. If singleton use single-types/api::theme.theme
      to: `/content-manager/collection-types/${THEME_UID}`,
      color: 'alternative600'
    }
  ];

  return (
    <Box padding={8} background="neutral100">
      <Typography variant="beta" as ="h2" paddingBottom={4}>Acciones Rápidas</Typography>
      <Flex gap={4} wrap="wrap">
        {actions.map((action, index) => (
          <Box key={index} basis="30%" grow={1} shrink={0} style={{ minWidth: '250px' }}>
            <Box 
              padding={4} 
              hasRadius 
              background="neutral0" 
              shadow="tableShadow"
              style={{ height: '100%', cursor: 'pointer' }}
              onClick={() => navigate(action.to)}
            >
              <Flex direction="column" alignItems="start" gap={3}>
                <Box 
                  background={action.color.replace('600', '100')} 
                  padding={2} 
                  hasRadius 
                  color={action.color}
                >
                  {React.cloneElement(action.icon as React.ReactElement, { width: 24, height: 24 })}
                </Box>
                <Box>
                  <Typography variant="delta" as="h3">{action.label}</Typography>
                  <Typography variant="omega" textColor="neutral600" style={{ marginTop: 4, display: 'block' }}>
                    {action.description}
                  </Typography>
                </Box>
              </Flex>
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default QuickActions;
