
function AppShell() {
  const location = useLocation();
  const { settings } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.direction = settings.language === 'ar' ? 'rtl' : 'ltr';
    root.lang = settings.language;
  }, [settings.language]);

  return (
    <>
      {loading && <div className="page-loader"><span /></div>}
      <Routes>
