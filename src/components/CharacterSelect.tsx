import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female';
  icon: string;
  description: string;
}

const characters: Character[] = [
  {
    id: 'male1',
    name: 'Алексей',
    gender: 'male',
    icon: '👨‍💼',
    description: 'Опытный сотрудник ПВЗ'
  },
  {
    id: 'female1',
    name: 'Мария',
    gender: 'female',
    icon: '👩‍💼',
    description: 'Энергичная и внимательная'
  },
  {
    id: 'male2',
    name: 'Дмитрий',
    gender: 'male',
    icon: '👨',
    description: 'Новичок, готовый учиться'
  },
  {
    id: 'female2',
    name: 'Анна',
    gender: 'female',
    icon: '👩',
    description: 'Профессионал с опытом'
  }
];

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
}

export default function CharacterSelect({ onSelect }: CharacterSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary animate-fade-in">
            Симулятор ПВЗ OZON
          </h1>
          <p className="text-2xl text-muted-foreground">
            Выберите своего персонажа
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {characters.map((character, index) => (
            <Card
              key={character.id}
              className="p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-primary border-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onSelect(character)}
            >
              <div className="text-center space-y-3">
                <div className="text-6xl mb-2">{character.icon}</div>
                <h3 className="text-xl font-bold">{character.name}</h3>
                <p className="text-sm text-muted-foreground">{character.description}</p>
                <Button variant="outline" className="w-full mt-2">
                  <Icon name="UserCheck" className="mr-2" size={16} />
                  Выбрать
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Gamepad2" className="text-primary" />
            Управление
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-white rounded border">W</kbd>
                <kbd className="px-3 py-1 bg-white rounded border">A</kbd>
                <kbd className="px-3 py-1 bg-white rounded border">S</kbd>
                <kbd className="px-3 py-1 bg-white rounded border">D</kbd>
                <span className="text-sm">Движение</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Mouse" size={24} className="text-primary" />
                <span className="text-sm">Осмотр (поворот камеры)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-white rounded border">E</kbd>
                <span className="text-sm">Взаимодействие</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-white rounded border">ESC</kbd>
                <span className="text-sm">Выход из режима камеры</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
