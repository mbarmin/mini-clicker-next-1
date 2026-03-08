'use client'

import { useTelegram, TelegramUser } from '@/hooks/useTelegram';
//const { tg, user, hapticFeedback } = useTelegram(); 
//const [showWelcome, setShowWelcome] = useState(true);


import { useState, useEffect, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code: string
}

interface UserStats {
  userId: number
  username?: string
  firstName: string
  lastName?: string
  totalClicks: number
  totalBalance: number
  clickPowerLevel: number
  autoClickerLevel: number
  gamesPlayed: number
  lastActive: string
  joinDate: string
}

interface UsersData {
  users: Record<string, UserStats>
  lastUpdated: string
}

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  gap: 20px;
  padding: 10px;
  overflow-y: auto;
`

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
`

const Card = styled.div`
  background-color: #ffeb3b;
  padding: 14px 10px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`

const CardTitle = styled.h2`
  font-size: 16px;
  margin-bottom: 8px;
  color: #000000;
`

const CardValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #000000;
`

const MainButtonContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

const ClickButton = styled.button`
  width: 140px;
  height: 140px;
  background-color: #ffeb3b;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.1s ease;

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
`

const ButtonText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #000000;
`

const Upgrades = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 40px;
`

const UpgradeCard = styled(Card)`
  text-align: center;
  padding: 12px 10px;
`

const UpgradeTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 10px;
  color: #000000;
`

const UpgradeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
`

const UpgradeButton = styled.button`
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #000000;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  max-width: 100px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`

const WelcomeOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--tg-theme-button-color, #ffeb3b) 0%, var(--tg-theme-bg-color, #fff176) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${pulse} 2s ease-in-out infinite;
`;


const WelcomeText = styled.h1`
  font-size: 32px;
`

const WelcomeSubtitle = styled.p`
  font-size: 18px;
`

const StartButton = styled.button`
  background-color: var(--tg-theme-button-text-color, #000000);
  color: var(--tg-theme-button-color, #ffeb3b);
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
`;


const UserInfo = styled.div`
  background-color: var(--tg-theme-secondary-bg-color, #ffeb3b);
  padding: 15px 20px;  /* было adding, исправили */
  border-radius: 15px;
  margin-bottom: 20px;
  text-align: center;
`;


const UserName = styled.div`
  font-size: 18px;
  font-weight: bold;
`

const UserId = styled.div`
  font-size: 14px;
  color: #666666;
`

interface GameState {
  balance: number
  clicks: number
  clickPower: number
  clickPowerLevel: number
  autoClicker: number
  autoClickerLevel: number
}

export default function GameContainer() {
		const { tg, user: telegramUser, hapticFeedback } = useTelegram();
  const [gameState, setGameState] = useState<GameState>({
    balance: 0,
    clicks: 0,
    clickPower: 1,
    clickPowerLevel: 0,
    autoClicker: 0,
    autoClickerLevel: 0,
  })

  const [isButtonAnimating, setIsButtonAnimating] = useState(false)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isTelegramReady, setIsTelegramReady] = useState(false)

  const [usersData, setUsersData] = useState<UsersData>({
    users: {},
    lastUpdated: new Date().toISOString(),
  })

  const loadUsersData = useCallback(async (): Promise<UsersData> => {
    try {
      const response = await fetch('/api/users/stats')
      if (response.ok) {
        const result = await response.json()
        return {
          users: Object.fromEntries(
            result.data.topPlayers.map((user: any) => [user.userId.toString(), user])
          ),
          lastUpdated: result.data.lastUpdated,
        }
      }
      throw new Error('Failed to load users data')
    } catch (error) {
      console.error('Ошибка загрузки данных пользователей:', error)

      try {
        const saved = localStorage.getItem('miniClickerUsersData')
        return saved
          ? JSON.parse(saved)
          : { users: {}, lastUpdated: new Date().toISOString() }
      } catch {
        return { users: {}, lastUpdated: new Date().toISOString() }
      }
    }
  }, [])

  const saveUsersData = useCallback(
    async (data: UsersData) => {
      try {
        const response = await fetch('/api/users/stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            username: user?.username,
            firstName: user?.first_name,
            lastName: user?.last_name,
            gameStats: {
              clicks: gameState.clicks,
              balance: gameState.balance,
              clickPowerLevel: gameState.clickPowerLevel,
              autoClickerLevel: gameState.autoClickerLevel,
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()

          setUsersData(prev => ({
            ...prev,
            users: {
              ...prev.users,
              [user!.id.toString()]: result.data,
            },
          }))
        } else {
          throw new Error('Failed to save users data')
        }
      } catch (error) {
        console.error('Ошибка сохранения данных пользователей:', error)

        try {
          localStorage.setItem('miniClickerUsersData', JSON.stringify(data))
          setUsersData(data)
        } catch (fallbackError) {
          console.error('Ошибка fallback сохранения:', fallbackError)
        }
      }
    },
    [user, gameState]
  )

  const getUserStats = useCallback(
    (userId: number): UserStats | null => {
      return usersData.users[userId.toString()] || null
    },
    [usersData.users]
  )

  const updateUserStats = useCallback(
    (user: TelegramUser, gameStats: GameState) => {
      const now = new Date().toISOString()
      const userId = user.id.toString()
      const existingStats = usersData.users[userId]

      const updatedStats: UserStats = {
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        totalClicks: (existingStats?.totalClicks || 0) + gameStats.clicks,
        totalBalance: Math.max(existingStats?.totalBalance || 0, gameStats.balance),
        clickPowerLevel: Math.max(
          existingStats?.clickPowerLevel || 0,
          gameStats.clickPowerLevel
        ),
        autoClickerLevel: Math.max(
          existingStats?.autoClickerLevel || 0,
          gameStats.autoClickerLevel
        ),
        gamesPlayed: Math.max(existingStats?.gamesPlayed || 0, 1),
        lastActive: now,
        joinDate: existingStats?.joinDate || now,
      }

      const updatedData: UsersData = {
        users: {
          ...usersData.users,
          [userId]: updatedStats,
        },
        lastUpdated: now,
      }

      saveUsersData(updatedData)
    },
    [usersData.users, saveUsersData]
  )

  const exportUserData = async () => {
    try {
      const response = await fetch('/api/users/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mini-clicker-users-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      console.error('Ошибка экспорта данных:', error)

      const dataToExport = {
        gameState,
        userData: usersData,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mini-clicker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }


// вот сюда добавить описание констант снизу
// Получаем статистику сразу, до любых условий
  const userStats = user ? getUserStats(user.id) : null;


// до этого места добавлено








  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadUsersData()
        setUsersData(data)
      } catch (error) {
        console.error('Ошибка загрузки пользовательских данных:', error)
      }
    }

    loadData()
  }, [loadUsersData])

  useEffect(() => {
    const initializeTelegram = async () => {
      if (typeof window !== 'undefined' && (window as any).Telegram) {
        const tg = (window as any).Telegram.WebApp

        if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
          setIsTelegramReady(true)
          return
        }

        const telegramUser = tg.initDataUnsafe.user as TelegramUser
        setUser(telegramUser)


        setTimeout(() => {
          setShowWelcome(false)
        }, 3000)

        setIsTelegramReady(true)
      } else {
        setIsTelegramReady(true)
      }
    }

    initializeTelegram()
  }, [])

  useEffect(() => {
    if (!isTelegramReady) return

    const savedState = localStorage.getItem('miniClickerState')
    if (savedState) {
      const parsedState = JSON.parse(savedState)

      if (
        parsedState.autoClickerLevel &&
        parsedState.autoClickerLevel !== parsedState.autoClicker
      ) {
        parsedState.autoClicker = parsedState.autoClickerLevel
      }

      setGameState(prevState => ({ ...prevState, ...parsedState }))
    }
  }, [isTelegramReady])

  useEffect(() => {
    localStorage.setItem('miniClickerState', JSON.stringify(gameState))
  }, [gameState])

  useEffect(() => {
    if (gameState.autoClickerLevel > 0 && gameState.autoClicker > 0) {
      const interval = setInterval(() => {
        setGameState(prevState => ({
          ...prevState,
          balance: prevState.balance + prevState.autoClicker,
        }))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [gameState.autoClickerLevel, gameState.autoClicker])

  useEffect(() => {
    if (!user) return

    const snapshot = {
      balance: gameState.balance,
      clicks: gameState.clicks,
      clickPower: gameState.clickPower,
      clickPowerLevel: gameState.clickPowerLevel,
      autoClicker: gameState.autoClicker,
      autoClickerLevel: gameState.autoClickerLevel,
    }

    const handler = setTimeout(() => {
      updateUserStats(user, snapshot as any)
    }, 3000)

    return () => clearTimeout(handler)
  }, [
    user,
    gameState.balance,
    gameState.clicks,
    gameState.clickPowerLevel,
    gameState.autoClickerLevel,
    gameState.autoClicker,
    gameState.clickPower,
    updateUserStats,
  ])

useEffect(() => {
  if (!tg || !user) return;

  const handleBeforeUnload = () => {
    updateUserStats(user, gameState as any);
  };

  tg.onEvent('viewportChanged', handleBeforeUnload);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    tg.offEvent('viewportChanged', handleBeforeUnload);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [tg, user, gameState, updateUserStats]);







  const getClickPowerCost = () =>
    Math.floor(10 * Math.pow(1.5, gameState.clickPowerLevel))

  const getAutoClickerCost = () =>
    Math.floor(50 * Math.pow(2, gameState.autoClickerLevel))

  const handleClick = () => {
    hapticFeedback('light');  // Лёгкая вибрация
    setGameState(prevState => ({
      ...prevState,
      balance: prevState.balance + prevState.clickPower,
      clicks: prevState.clicks + 1,
    }))
    setIsButtonAnimating(true)
    setTimeout(() => setIsButtonAnimating(false), 100)
  }

  const upgradeClickPower = () => {
    const cost = getClickPowerCost()
    if (gameState.balance >= cost) {
      setGameState(prevState => ({
        ...prevState,
        balance: prevState.balance - cost,
        clickPowerLevel: prevState.clickPowerLevel + 1,
        clickPower: prevState.clickPower + 1,
      }))
    }
  }

  const buyAutoClicker = () => {
    const cost = getAutoClickerCost()
    if (gameState.balance >= cost) {
      setGameState(prevState => ({
        ...prevState,
        balance: prevState.balance - cost,
        autoClickerLevel: prevState.autoClickerLevel + 1,
        autoClicker: prevState.autoClickerLevel + 1,
      }))
    }
  }

  if (showWelcome && user) {
    return (
      <WelcomeOverlay>
        <WelcomeText>Привет, {user.username || user.first_name}! 👋</WelcomeText>
        <WelcomeSubtitle>
          Добро пожаловать в Mini Clicker!
          <br />
          Нажми на кнопку, чтобы начать играть
        </WelcomeSubtitle>
        <StartButton onClick={() => setShowWelcome(false)}>Начать игру</StartButton>
      </WelcomeOverlay>
    )
  }

  return (
    <Container className="telegram-web-app scroll-container">
      {user && (
        <UserInfo>
          <UserName>
            {user.first_name} {user.last_name || ''}
            {user.username && ` (@${user.username})`}
          </UserName>
          <UserId>ID: {user.id}</UserId>
          {//(() => {  это тоже закоментировал
			userStats ? ( // ← используем готовую переменную
            // было const stats = getUserStats(user.id)
            // было return stats ? (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                <div>Игр сыграно: {stats.gamesPlayed}</div>
                <div>Рекорд: {stats.totalBalance.toLocaleString()}</div>
                <div>Всего кликов: {stats.totalClicks.toLocaleString()}</div>
              </div>
            ) : null
          //})()   это тоже закоментировал
		  }
        </UserInfo>
      )}

      <Header>
        <Card>
          <CardTitle>Баланс</CardTitle>
          <CardValue>{gameState.balance}</CardValue>
        </Card>
        <Card>
          <CardTitle>Клики</CardTitle>
          <CardValue>{gameState.clicks}</CardValue>
        </Card>
      </Header>

      <MainButtonContainer>
        <ClickButton
          onClick={handleClick}
          style={{
            animation: isButtonAnimating ? 'none' : `none`,
            transform: isButtonAnimating ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          <ButtonText>НАЖМИ!</ButtonText>
        </ClickButton>
      </MainButtonContainer>

      <Upgrades>
        <UpgradeCard>
          <UpgradeTitle>Сила клика</UpgradeTitle>
          <UpgradeInfo>
            <span>Уровень: {gameState.clickPowerLevel}</span>
            <span>Стоимость: {getClickPowerCost()}</span>
          </UpgradeInfo>
          <UpgradeButton
            onClick={upgradeClickPower}
            disabled={gameState.balance < getClickPowerCost()}
          >
            Улучшить
          </UpgradeButton>
        </UpgradeCard>

        <UpgradeCard>
          <UpgradeTitle>Автокликер</UpgradeTitle>
          <UpgradeInfo>
            <span>Уровень: {gameState.autoClickerLevel}</span>
            <span>Стоимость: {getAutoClickerCost()}</span>
          </UpgradeInfo>
          <UpgradeButton
            onClick={buyAutoClicker}
            disabled={gameState.balance < getAutoClickerCost()}
          >
            Купить
          </UpgradeButton>
        </UpgradeCard>
      </Upgrades>
    </Container>
  )
}
