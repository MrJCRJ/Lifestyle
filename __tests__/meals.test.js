/**
 * Testes básicos para formulários de refeições
 */

describe('Formulário de Refeições', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="meals-form">
        <input type="radio" name="hasMeals" value="yes" />
        <input type="radio" name="hasMeals" value="no" />
        <input type="number" id="mealsCount" min="1" max="8" />
      </div>
    `;
  });

  function collectMealsData() {
    const hasMeals = document.querySelector('input[name="hasMeals"]:checked');

    if (!hasMeals) {
      throw new Error('Por favor, selecione se você faz refeições!');
    }

    if (hasMeals.value === 'no') {
      return { hasMeals: false, mealsCount: 0 };
    }

    const mealsCountInput = document.getElementById('mealsCount');
    const mealsCount = parseInt(mealsCountInput.value);

    if (!mealsCountInput.value || isNaN(mealsCount)) {
      throw new Error('Por favor, informe quantas refeições você faz por dia!');
    }

    if (mealsCount < 1 || mealsCount > 8) {
      throw new Error('O número de refeições deve estar entre 1 e 8!');
    }

    return {
      hasMeals: true,
      mealsCount
    };
  }

  test('Deve validar seleção obrigatória de refeições', () => {
    expect(() => {
      collectMealsData();
    }).toThrow('Por favor, selecione se você faz refeições!');
  });

  test('Deve permitir não fazer refeições', () => {
    const noRadio = document.querySelector('input[name="hasMeals"][value="no"]');
    noRadio.checked = true;

    const data = collectMealsData();
    expect(data.hasMeals).toBe(false);
    expect(data.mealsCount).toBe(0);
  });

  test('Deve validar quantidade de refeições quando selecionado sim', () => {
    const yesRadio = document.querySelector('input[name="hasMeals"][value="yes"]');
    yesRadio.checked = true;

    expect(() => {
      collectMealsData();
    }).toThrow('Por favor, informe quantas refeições você faz por dia!');
  });

  test('Deve validar faixa de refeições (mínimo)', () => {
    const yesRadio = document.querySelector('input[name="hasMeals"][value="yes"]');
    const mealsCount = document.getElementById('mealsCount');

    yesRadio.checked = true;
    mealsCount.value = '0';

    expect(() => {
      collectMealsData();
    }).toThrow('O número de refeições deve estar entre 1 e 8!');
  });

  test('Deve validar faixa de refeições (máximo)', () => {
    const yesRadio = document.querySelector('input[name="hasMeals"][value="yes"]');
    const mealsCount = document.getElementById('mealsCount');

    yesRadio.checked = true;
    mealsCount.value = '10';

    expect(() => {
      collectMealsData();
    }).toThrow('O número de refeições deve estar entre 1 e 8!');
  });

  test('Deve coletar dados de refeições corretamente', () => {
    const yesRadio = document.querySelector('input[name="hasMeals"][value="yes"]');
    const mealsCount = document.getElementById('mealsCount');

    yesRadio.checked = true;
    mealsCount.value = '4';

    const data = collectMealsData();
    expect(data.hasMeals).toBe(true);
    expect(data.mealsCount).toBe(4);
  });
});
