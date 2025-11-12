/**
 * Testes para garantir fallback de metadados nos cronogramas
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Schedule Render Fallbacks', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = {
      parseDateKey: jest.fn((key) => {
        if (!key) return null;
        const [year, month, day] = key.split('-').map(Number);
        return new Date(year, month - 1, day);
      }),
      getDayName: jest.fn((date) => {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[date.getDay()];
      }),
      getFormattedDate: jest.fn((date) => {
        const formatter = new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return formatter.format(date);
      }),
      openEditPlanner: jest.fn(),
      console
    };

    const filePath = path.join(__dirname, '..', 'js/ui/schedule-render.js');
    const content = fs.readFileSync(filePath, 'utf-8');
    vm.createContext(sandbox);
    vm.runInContext(content, sandbox);
  });

  test('renderScheduleHeader usa fallback quando metadados faltam', () => {
    const html = sandbox.renderScheduleHeader({ date: '2025-11-12' });

    expect(sandbox.parseDateKey).toHaveBeenCalledWith('2025-11-12');
    expect(sandbox.getDayName).toHaveBeenCalled();
    expect(sandbox.getFormattedDate).toHaveBeenCalled();
    expect(html).toContain('Quarta');
    expect(html).toContain('12 de novembro de 2025');
  });

  test('renderEmptyDayCard usa fallback para dados antigos', () => {
    const html = sandbox.renderEmptyDayCard({ date: '2025-11-12' });

    expect(html).toContain('Quarta');
    expect(html).toContain('12 de novembro de 2025');
    expect(html).toContain('Planejar');
  });
});
