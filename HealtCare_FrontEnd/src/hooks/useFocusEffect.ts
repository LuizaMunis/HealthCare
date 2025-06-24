  // useFocusEffect é um hook que roda toda vez que a tela entra em foco.
  // É ideal para carregar dados que podem mudar.
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const userInfoString = await AsyncStorage.getItem('userInfo');
          if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            // Pega o primeiro nome para uma saudação mais pessoal
            const firstName = userInfo.nome_completo.split(' ')[0];
            setUserName(firstName);
          }
        } catch (error) {
          console.error("Falha ao carregar dados do usuário.", error);
          // Você pode adicionar um tratamento de erro aqui, como redirecionar para o login
        } finally {
          setLoading(false);
        }
      };

      loadUserData();
    }, [])
  );