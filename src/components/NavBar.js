import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const provider = new GoogleAuthProvider();

export const NAV_ITEMS = [
  { key: 'problems', label: 'Problem' },
  { key: 'explore', label: 'Explore' },
  { key: 'product', label: 'Product' },
  { key: 'developer', label: 'Developer' },
];

function LogoIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </SvgIcon>
  );
}

function MenuIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </SvgIcon>
  );
}

function UserMenu({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const name = user.displayName || user.email || 'Account';

  return (
    <>
      <Button
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        sx={{ textTransform: 'none', gap: 1, ml: 1 }}
      >
        <Avatar
          src={user.photoURL || undefined}
          alt=""
          sx={{ width: 28, height: 28, fontSize: 14 }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box
          component="span"
          sx={{
            display: { xs: 'none', sm: 'inline' },
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <ListItemText primary={name} secondary={user.email} />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            signOut(auth);
          }}
        >
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

function NavBar({ activeKey, onNavigate }) {
  const [user, loading] = useAuthState(auth);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  const navigate = (key) => {
    setMobileAnchorEl(null);
    onNavigate(key);
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container>
        <Toolbar disableGutters sx={{ gap: 1 }}>
          {/* Logo */}
          <Box
            component="button"
            type="button"
            onClick={() => navigate('problems')}
            aria-label="Coding Platform home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: 0,
              bgcolor: 'transparent',
              color: 'text.primary',
              cursor: 'pointer',
              p: 0,
              mr: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <LogoIcon fontSize="small" />
            </Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline' } }}>
              Coding Platform
            </Typography>
          </Box>

          {/* Menu items: inline on md+, collapsed into a menu on small screens */}
          <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {NAV_ITEMS.map((item) => {
              const active = item.key === activeKey;
              return (
                <Button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    fontWeight: active ? 600 : 500,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
          <IconButton
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            onClick={(e) => setMobileAnchorEl(e.currentTarget)}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={mobileAnchorEl}
            open={Boolean(mobileAnchorEl)}
            onClose={() => setMobileAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {NAV_ITEMS.map((item) => (
              <MenuItem
                key={item.key}
                selected={item.key === activeKey}
                onClick={() => navigate(item.key)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          {/* Auth: nothing while Firebase restores the session, to avoid a Sign In flash */}
          {!loading && (user ? (
            <UserMenu user={user} />
          ) : (
            <Button
              variant="contained"
              disableElevation
              onClick={() => signInWithPopup(auth, provider)}
              sx={{ textTransform: 'none', ml: 1, borderRadius: 999, px: 2.5 }}
            >
              Sign In
            </Button>
          ))}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
