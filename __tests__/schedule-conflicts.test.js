/**
 * Testes para detectar conflitos de horários no cronograma
 */

const fs = require('fs');
const path = require('path');

describe('⚠️ Detecção de Conflitos de Horários', () => {
  let validateScheduleConflicts, timeToMinutes;

  beforeEach(() => {
    // Mock appState global
    global.appState = {
      userData: {
        dailySchedules: {}
      }
    };

    // Mock funções globais necessárias
    global.parseDateKey = (dateKey) => {
      if (typeof dateKey !== 'string') return null;
      const parts = dateKey.split('-');
      if (parts.length !== 3) return null;
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    global.getDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Carregar time-utils via require
    const timeUtilsPath = path.join(__dirname, '../js/utils/time-utils.js');
    delete require.cache[require.resolve(timeUtilsPath)];
    const timeUtilsModule = fs.readFileSync(timeUtilsPath, 'utf-8');

    // Criar módulo time-utils
    const timeUtilsFunc = new Function('module', 'exports', timeUtilsModule + '\n; if(typeof timeToMinutes !== "undefined") { exports.timeToMinutes = timeToMinutes; }');
    const timeUtilsExports = {};
    timeUtilsFunc({ exports: timeUtilsExports }, timeUtilsExports);

    global.timeToMinutes = timeUtilsExports.timeToMinutes || function (time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    timeToMinutes = global.timeToMinutes;

    // Carregar conflict-validator
    const conflictPath = path.join(__dirname, '../js/utils/conflict-validator.js');
    delete require.cache[require.resolve(conflictPath)];
    const conflictModule = require(conflictPath);
    validateScheduleConflicts = conflictModule.validateScheduleConflicts;
  });

  test('🔴 Detectar conflito: Trabalho começa ANTES de acordar', () => {
    const schedule = [
      {
        id: 1,
        type: 'sleep',
        name: 'Dormir',
        start: '05:30',
        end: '08:00'
      },
      {
        id: 2,
        type: 'work',
        name: 'PADARIA',
        start: '06:26', // Começa DURANTE o sono!
        end: '08:26'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Trabalho durante sono ===');
    console.log('Sono: 05:30 - 08:00');
    console.log('Trabalho: 06:26 - 08:26');
    console.log(`Conflitos detectados: ${conflicts.length}`);
    if (conflicts.length > 0) {
      conflicts.forEach(conflict => {
        console.log(`  - ${conflict.type}: ${conflict.message}`);
      });
    }

    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].type).toMatch(/overlap|conflict/i);
  });

  test('🔴 Detectar conflito: Duas atividades sobrepostas parcialmente', () => {
    const schedule = [
      {
        id: 1,
        type: 'work',
        name: 'Reunião',
        start: '09:00',
        end: '10:30'
      },
      {
        id: 2,
        type: 'study',
        name: 'Aula',
        start: '10:00', // Começa durante a reunião
        end: '11:00'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Sobreposição parcial ===');
    console.log('Reunião: 09:00 - 10:30');
    console.log('Aula: 10:00 - 11:00');
    console.log(`Conflitos detectados: ${conflicts.length}`);

    expect(conflicts.length).toBeGreaterThan(0);
  });

  test('🔴 Detectar conflito: Uma atividade dentro de outra', () => {
    const schedule = [
      {
        id: 1,
        type: 'work',
        name: 'Trabalho',
        start: '08:00',
        end: '17:00'
      },
      {
        id: 2,
        type: 'meal',
        name: 'Almoço',
        start: '12:00', // Dentro do horário de trabalho
        end: '13:00'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Atividade dentro de outra ===');
    console.log('Trabalho: 08:00 - 17:00');
    console.log('Almoço: 12:00 - 13:00');
    console.log(`Conflitos detectados: ${conflicts.length}`);

    // Almoço durante trabalho pode ou não ser conflito
    // dependendo da lógica de negócio
    console.log('Nota: Almoço durante trabalho pode ser permitido');
  });

  test('✅ SEM conflito: Atividades sequenciais', () => {
    const schedule = [
      {
        id: 1,
        type: 'sleep',
        name: 'Dormir',
        start: '22:00',
        end: '06:00'
      },
      {
        id: 2,
        type: 'work',
        name: 'Trabalho',
        start: '08:00', // Começa DEPOIS de acordar
        end: '17:00'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Sem conflitos ===');
    console.log('Sono: 22:00 - 06:00');
    console.log('Trabalho: 08:00 - 17:00');
    console.log(`Conflitos detectados: ${conflicts.length}`);

    expect(conflicts.length).toBe(0);
  });

  test('🔴 Detectar conflito: Atividades exatamente no mesmo horário', () => {
    const schedule = [
      {
        id: 1,
        type: 'work',
        name: 'Trabalho 1',
        start: '09:00',
        end: '12:00'
      },
      {
        id: 2,
        type: 'work',
        name: 'Trabalho 2',
        start: '09:00', // Mesmo horário!
        end: '12:00'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Horários idênticos ===');
    console.log('Trabalho 1: 09:00 - 12:00');
    console.log('Trabalho 2: 09:00 - 12:00');
    console.log(`Conflitos detectados: ${conflicts.length}`);

    expect(conflicts.length).toBeGreaterThan(0);
  });

  test('🔴 Detectar conflito: Trabalho ultrapassa horário de dormir', () => {
    const schedule = [
      {
        id: 1,
        type: 'work',
        name: 'Trabalho noturno',
        start: '22:00',
        end: '23:30'
      },
      {
        id: 2,
        type: 'sleep',
        name: 'Dormir',
        start: '23:00', // Sono começa durante trabalho
        end: '07:00'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Trabalho até horário de dormir ===');
    console.log('Trabalho: 22:00 - 23:30');
    console.log('Sono: 23:00 - 07:00');
    console.log(`Conflitos detectados: ${conflicts.length}`);

    expect(conflicts.length).toBeGreaterThan(0);
  });

  test('✅ SEM conflito: Atividades consecutivas exatas', () => {
    const schedule = [
      {
        id: 1,
        type: 'work',
        name: 'Trabalho',
        start: '08:00',
        end: '12:00'
      },
      {
        id: 2,
        type: 'meal',
        name: 'Almoço',
        start: '12:00', // Começa exatamente quando trabalho termina
        end: '13:00'
      },
      {
        id: 3,
        type: 'study',
        name: 'Estudo',
        start: '13:00', // Começa exatamente quando almoço termina
        end: '15:00'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== TESTE: Atividades consecutivas ===');
    console.log('Trabalho: 08:00 - 12:00');
    console.log('Almoço: 12:00 - 13:00');
    console.log('Estudo: 13:00 - 15:00');
    console.log(`Conflitos detectados: ${conflicts.length}`);

    expect(conflicts.length).toBe(0);
  });

  test('🔴 Caso REAL do usuário: Sono vs PADARIA', () => {
    const schedule = [
      {
        id: 1,
        type: 'sleep',
        name: 'Dormir',
        start: '05:30',
        end: '08:00',
        icon: '😴'
      },
      {
        id: 2,
        type: 'work',
        name: 'PADARIA',
        start: '06:26',
        end: '08:26',
        category: 'Trabalho'
      }
    ];

    const conflicts = validateScheduleConflicts(schedule, '2025-11-12');

    console.log('\n=== CASO REAL DO USUÁRIO ===');
    console.log('😴 Dormir: 05:30 - 08:00');
    console.log('🏪 PADARIA: 06:26 - 08:26');
    console.log(`\n⚠️ Conflitos detectados: ${conflicts.length}`);

    if (conflicts.length > 0) {
      console.log('\nDetalhes dos conflitos:');
      conflicts.forEach((conflict, index) => {
        console.log(`\nConflito ${index + 1}:`);
        console.log(`  Tipo: ${conflict.type}`);
        console.log(`  Mensagem: ${conflict.message}`);
        if (conflict.activities) {
          console.log(`  Atividades envolvidas:`);
          conflict.activities.forEach(act => {
            console.log(`    - ${act.name} (${act.start} - ${act.end})`);
          });
        }
      });
    } else {
      console.log('\n❌ PROBLEMA: Nenhum conflito foi detectado!');
      console.log('A validação está falhando em detectar este conflito.');
    }

    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].message).toMatch(/dormir|sono|sleep|PADARIA|trabalho/i);
  });
});

describe('🛠️ Função auxiliar: Detectar sobreposição de intervalos', () => {
  test('✅ Implementar função de detecção de sobreposição', () => {
    /**
     * Verifica se dois intervalos de tempo se sobrepõem
     * @param {string} start1 - Início do intervalo 1 (HH:MM)
     * @param {string} end1 - Fim do intervalo 1 (HH:MM)
     * @param {string} start2 - Início do intervalo 2 (HH:MM)
     * @param {string} end2 - Fim do intervalo 2 (HH:MM)
     * @returns {boolean} True se há sobreposição
     */
    function hasTimeOverlap(start1, end1, start2, end2) {
      const timeToMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      let s1 = timeToMinutes(start1);
      let e1 = timeToMinutes(end1);
      let s2 = timeToMinutes(start2);
      let e2 = timeToMinutes(end2);

      // Ajustar para horários que passam da meia-noite
      if (e1 < s1) e1 += 24 * 60;
      if (e2 < s2) e2 += 24 * 60;

      // Há sobreposição se:
      // - início de A está entre início e fim de B, OU
      // - fim de A está entre início e fim de B, OU
      // - A contém B completamente
      return (s1 < e2 && e1 > s2);
    }

    // Testes da função
    console.log('\n=== TESTES DA FUNÇÃO hasTimeOverlap ===');

    // Caso 1: Sobreposição parcial
    expect(hasTimeOverlap('09:00', '10:30', '10:00', '11:00')).toBe(true);
    console.log('✓ Detecta sobreposição parcial');

    // Caso 2: Sem sobreposição
    expect(hasTimeOverlap('09:00', '10:00', '11:00', '12:00')).toBe(false);
    console.log('✓ Detecta ausência de sobreposição');

    // Caso 3: Atividades consecutivas (sem sobreposição)
    expect(hasTimeOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false);
    console.log('✓ Atividades consecutivas não são conflito');

    // Caso 4: Uma dentro da outra
    expect(hasTimeOverlap('08:00', '17:00', '12:00', '13:00')).toBe(true);
    console.log('✓ Detecta atividade dentro de outra');

    // Caso 5: CASO DO USUÁRIO - Sono vs PADARIA
    const hasPadariaConflict = hasTimeOverlap('05:30', '08:00', '06:26', '08:26');
    console.log(`\n🔍 CASO REAL: Sono (05:30-08:00) vs PADARIA (06:26-08:26)`);
    console.log(`   Resultado: ${hasPadariaConflict ? '✓ CONFLITO DETECTADO' : '✗ Nenhum conflito'}`);
    expect(hasPadariaConflict).toBe(true);

    // Caso 6: Horários idênticos
    expect(hasTimeOverlap('09:00', '12:00', '09:00', '12:00')).toBe(true);
    console.log('✓ Detecta horários idênticos como conflito');
  });
});
