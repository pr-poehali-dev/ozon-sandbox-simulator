import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import CharacterSelect from '@/components/CharacterSelect';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Game3D = lazy(() => import('@/components/Game3D'));

interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female';
  icon: string;
  description: string;
}

type GameState = 'character-select' | 'exploring' | 'working';

interface Order {
  id: string;
  code: string;
  cell: string;
  customerName: string;
  arrived: number;
}

interface Customer {
  id: string;
  name: string;
  orderCode: string;
  mood: 'happy' | 'neutral' | 'angry';
  waitTime: number;
}

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('character-select');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [energy, setEnergy] = useState(100);
  const [rating, setRating] = useState(5.0);
  const [canUse3D, setCanUse3D] = useState(true);

  useEffect(() => {
    const webGLSupported = checkWebGLSupport();
    const isMobile = isMobileDevice();
    setCanUse3D(webGLSupported && !isMobile);
  }, []);
  const [scannedCode, setScannedCode] = useState('');
  const [currentView, setCurrentView] = useState<'reception' | 'warehouse' | 'customer'>('reception');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerQueue, setCustomerQueue] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [orders] = useState<Order[]>([
    { id: '1', code: '1234', cell: 'A-15', customerName: 'Иванов И.И.', arrived: Date.now() },
    { id: '2', code: '5678', cell: 'B-23', customerName: 'Петрова А.С.', arrived: Date.now() },
    { id: '3', code: '9012', cell: 'C-08', customerName: 'Сидоров П.П.', arrived: Date.now() },
    { id: '4', code: '3456', cell: 'A-42', customerName: 'Козлова М.В.', arrived: Date.now() },
  ]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    if (canUse3D) {
      setGameState('exploring');
      toast.success(`Добро пожаловать, ${character.name}!`);
    } else {
      setGameState('working');
      toast.success(`Добро пожаловать, ${character.name}! Приступаем к работе`);
    }
  };

  const handleStartWork = () => {
    setGameState('working');
    toast.success('Смена началась! Приступайте к работе');
  };

  const handleExitWork = () => {
    setGameState('exploring');
    toast.info('Вы вышли из рабочей зоны');
  };

  const generateCustomer = () => {
    const names = ['Иванов', 'Петрова', 'Сидоров', 'Козлова', 'Морозов', 'Новикова'];
    const moods: ('happy' | 'neutral' | 'angry')[] = ['happy', 'neutral', 'neutral', 'angry'];
    
    const randomOrder = orders[Math.floor(Math.random() * orders.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: names[Math.floor(Math.random() * names.length)],
      orderCode: randomOrder.code,
      mood: moods[Math.floor(Math.random() * moods.length)],
      waitTime: 0
    };
  };

  useEffect(() => {
    if (gameState !== 'working') return;

    const energyTimer = setInterval(() => {
      setEnergy(prev => Math.max(0, prev - 0.5));
    }, 5000);

    const customerTimer = setInterval(() => {
      if (customerQueue.length < 3 && Math.random() > 0.5) {
        setCustomerQueue(prev => [...prev, generateCustomer()]);
      }
    }, 8000);

    const queueTimer = setInterval(() => {
      setCustomerQueue(prev => 
        prev.map(customer => {
          const newWaitTime = customer.waitTime + 1;
          let newMood = customer.mood;
          
          if (newWaitTime > 20) newMood = 'angry';
          else if (newWaitTime > 10) newMood = 'neutral';
          
          return { ...customer, waitTime: newWaitTime, mood: newMood };
        })
      );
    }, 1000);

    return () => {
      clearInterval(energyTimer);
      clearInterval(customerTimer);
      clearInterval(queueTimer);
    };
  }, [gameState, customerQueue.length, orders]);



  const handleScan = () => {
    const order = orders.find(o => o.code === scannedCode);
    
    if (order) {
      setSelectedOrder(order);
      setEnergy(prev => Math.max(0, prev - 2));
      toast.success(`Посылка найдена: ${order.customerName}`);
      setScannedCode('');
    } else {
      toast.error('Неверный код!');
      setRating(prev => Math.max(1, prev - 0.1));
    }
  };



  const handleGiveOrder = () => {
    if (currentCustomer && selectedOrder && currentCustomer.orderCode === selectedOrder.code) {
      const moodBonus = currentCustomer.mood === 'happy' ? 0.2 : currentCustomer.mood === 'angry' ? -0.1 : 0;
      setRating(prev => Math.min(5, prev + 0.1 + moodBonus));
      setEnergy(prev => Math.max(0, prev - 5));
      

      setCustomerQueue(prev => prev.filter(c => c.id !== currentCustomer.id));
      
      toast.success('Заказ выдан! Клиент доволен');
      setSelectedOrder(null);
      setCurrentCustomer(null);
      setCurrentView('reception');
    } else {
      toast.error('Это не тот заказ!');
      setRating(prev => Math.max(1, prev - 0.3));
    }
  };

  const getMoodIcon = (mood: 'happy' | 'neutral' | 'angry') => {
    switch (mood) {
      case 'happy': return 'Smile';
      case 'neutral': return 'Meh';
      case 'angry': return 'Frown';
    }
  };

  const getMoodColor = (mood: 'happy' | 'neutral' | 'angry') => {
    switch (mood) {
      case 'happy': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'angry': return 'text-red-500';
    }
  };

  if (gameState === 'character-select') {
    return <CharacterSelect onSelect={handleCharacterSelect} />;
  }

  if (gameState === 'exploring') {
    if (!canUse3D) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center space-y-6">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-900">3D-режим недоступен</h2>
            <p className="text-gray-600">
              На вашем устройстве 3D-режим не поддерживается.
            </p>
            <p className="text-gray-600">
              Но вы можете сразу перейти к работе!
            </p>
            <button
              onClick={handleStartWork}
              className="w-full bg-primary text-white py-4 px-6 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Начать работу
            </button>
          </div>
        </div>
      );
    }

    return (
      <ErrorBoundary
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center space-y-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900">3D-режим недоступен</h2>
              <p className="text-gray-600">
                Ваш браузер не поддерживает 3D-графику.
              </p>
              <p className="text-gray-600">
                Но вы можете сразу перейти к работе!
              </p>
              <button
                onClick={handleStartWork}
                className="w-full bg-primary text-white py-4 px-6 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Начать работу
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🚀</div>
              <p className="text-xl font-semibold text-gray-700">Загрузка 3D-мира...</p>
            </div>
          </div>
        }>
          <Game3D onStartWork={handleStartWork} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">OZON ПВЗ</div>
            <Badge variant="outline" className="text-sm">
              {selectedCharacter?.icon} {selectedCharacter?.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon name="Zap" size={16} className="text-yellow-500" />
                Энергия
              </div>
              <Progress value={energy} className="w-32 h-2" />
              <span className="text-xs text-muted-foreground">{energy.toFixed(0)}%</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon name="Star" size={16} className="text-orange-500" />
                Рейтинг
              </div>
              <div className="text-2xl font-bold text-primary">{rating.toFixed(1)}</div>
            </div>
            
            <Button variant="outline" onClick={handleExitWork}>
              <Icon name="LogOut" className="mr-2" size={16} />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-28 pb-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button 
              variant={currentView === 'reception' ? 'default' : 'outline'}
              onClick={() => setCurrentView('reception')}
              className="h-16"
            >
              <Icon name="Package" className="mr-2" />
              Приемка
            </Button>
            <Button 
              variant={currentView === 'warehouse' ? 'default' : 'outline'}
              onClick={() => setCurrentView('warehouse')}
              className="h-16"
            >
              <Icon name="LayoutGrid" className="mr-2" />
              Склад
            </Button>
            <Button 
              variant={currentView === 'customer' ? 'default' : 'outline'}
              onClick={() => setCurrentView('customer')}
              className="h-16"
              disabled={customerQueue.length === 0}
            >
              <Icon name="User" className="mr-2" />
              Выдача
            </Button>
          </div>

          {currentView === 'reception' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="ScanBarcode" className="text-primary" />
                  Сканирование посылки
                </h2>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Введите код посылки (1234, 5678, 9012...)"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                    className="text-lg"
                  />
                  <Button onClick={handleScan} size="lg">
                    <Icon name="Search" className="mr-2" />
                    Сканировать
                  </Button>
                </div>
              </Card>

              {selectedOrder && (
                <Card className="p-6 bg-green-50 border-green-200 animate-fade-in">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="CheckCircle2" className="text-green-600" />
                    Посылка найдена
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Получатель</p>
                      <p className="text-lg font-semibold">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Код заказа</p>
                      <p className="text-lg font-semibold">{selectedOrder.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ячейка на складе</p>
                      <p className="text-2xl font-bold text-primary">{selectedOrder.cell}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {currentView === 'warehouse' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Warehouse" className="text-primary" />
                  Стеллажи склада
                </h2>
                <div className="grid grid-cols-4 gap-3">
                  {orders.map((order) => (
                    <Card 
                      key={order.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                        selectedOrder?.id === order.id ? 'border-primary border-2 bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedOrder(order);
                        setEnergy(prev => Math.max(0, prev - 3));
                        toast.success(`Взяли посылку из ячейки ${order.cell}`);
                      }}
                    >
                      <div className="text-center space-y-2">
                        <Icon name="Package" className="mx-auto text-primary" size={32} />
                        <div className="font-bold text-xl">{order.cell}</div>
                        <div className="text-xs text-muted-foreground">{order.customerName}</div>
                        <Badge variant="outline" className="text-xs">{order.code}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {currentView === 'customer' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Users" className="text-primary" />
                  Очередь клиентов
                </h2>
                <div className="space-y-3">
                  {customerQueue.map((customer, index) => (
                    <Card 
                      key={customer.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        currentCustomer?.id === customer.id ? 'border-primary border-2 bg-blue-50' : ''
                      }`}
                      onClick={() => setCurrentCustomer(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                          <div>
                            <div className="font-semibold text-lg">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">Код: {customer.orderCode}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <Icon name="Clock" size={16} className="inline mr-1" />
                            {customer.waitTime}с
                          </div>
                          <Icon 
                            name={getMoodIcon(customer.mood)} 
                            className={getMoodColor(customer.mood)}
                            size={32}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  {customerQueue.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Coffee" size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Нет клиентов. Можно передохнуть!</p>
                    </div>
                  )}
                </div>
              </Card>

              {currentCustomer && selectedOrder && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="HandCoins" className="text-blue-600" />
                    Выдача заказа
                  </h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Клиент просит</p>
                      <p className="font-bold text-lg">Код: {currentCustomer.orderCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">У вас в руках</p>
                      <p className="font-bold text-lg">Код: {selectedOrder.code}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleGiveOrder} 
                    size="lg" 
                    className="w-full"
                    disabled={currentCustomer.orderCode !== selectedOrder.code}
                  >
                    {currentCustomer.orderCode === selectedOrder.code ? (
                      <>
                        <Icon name="CheckCircle2" className="mr-2" />
                        Выдать заказ
                      </>
                    ) : (
                      <>
                        <Icon name="XCircle" className="mr-2" />
                        Коды не совпадают!
                      </>
                    )}
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;