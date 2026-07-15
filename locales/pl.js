/** Polish locale — polska lokalizacja Breathwork. */
var I18N_PL = {
  app: {
    title: 'Oddech',
    loading: 'Ładowanie…'
  },
  update: {
    available: 'Dostępna jest nowa wersja!',
    reload: 'Zaktualizuj teraz',
    notice: 'Zaktualizowano do wersji {version}.'
  },
  install: {
    hint:
      'Instalacja na iPhonie: dotknij <strong>Udostępnij</strong> → <strong>Dodaj do ekranu początkowego</strong>.',
    dismiss: 'Zamknij'
  },
  list: {
    intro:
      'Wybierz technikę oddechową z przewodnikiem. Każda sesja zawiera sygnały czasowe, którym możesz podążać z zamkniętymi oczami.',
    continueLast: 'Kontynuuj z ostatnimi ustawieniami',
    history: 'Historia',
    settings: 'Ustawienia',
    safetyNotice:
      'Ćwicz siedząc lub leżąc. Nigdy nie wymuszaj oddechu ani wstrzymywania. Przerwij i odpocznij, jeśli czujesz zawroty głowy lub osłabienie.',
    safetyInfo: 'Informacje o bezpieczeństwie',
    filterTechniques: 'Filtruj techniki',
    filterGoal: 'Filtruj według celu',
    filterIntensity: 'Filtruj według intensywności'
  },
  goal: {
    all: 'Wszystkie',
    favorites: 'Ulubione',
    calm: 'Spokój',
    sleep: 'Sen',
    focus: 'Koncentracja',
    energizing: 'Pobudzenie'
  },
  intensity: {
    all: 'Wszystkie poziomy',
    gentle: 'Łagodna',
    moderate: 'Umiarkowana',
    intense: 'Intensywna'
  },
  theme: {
    system: 'Systemowy (ciemny)',
    dark: 'Ciemny',
    warm: 'Ciepły',
    highContrast: 'Wysoki kontrast'
  },
  detail: {
    backAria: 'Wróć do technik',
    technique: 'Technika',
    addFavorite: 'Dodaj do ulubionych',
    removeFavorite: 'Usuń z ulubionych',
    howToPractice: 'Jak ćwiczyć',
    phaseSequence: 'Sekwencja faz',
    whatToExpect: 'Czego się spodziewać',
    continueSetup: 'Przejdź do ustawień',
    techniqueDetails: 'Szczegóły techniki'
  },
  meta: {
    beginnerFriendly: 'Dla początkujących',
    someExperience: 'Wymaga doświadczenia',
    pace: 'Tempo: {pace}',
    includesHolds: 'Ze wstrzymywaniem',
    noHolds: 'Bez wstrzymywania',
    nasalControl: 'Kontrola nozdrzy',
    favorite: 'Ulubione',
    paceSlow: 'wolne',
    paceModerate: 'umiarkowane',
    paceRapid: 'szybkie'
  },
  duration: {
    setup: 'Ustawienia',
    setupTitle: '{name} — Ustawienia',
    backAria: 'Wróć do instrukcji',
    sessionLength: 'Długość sesji',
    numberOfRounds: 'Liczba rund',
    custom: 'Własna',
    min: 'min',
    round: 'runda',
    rounds: 'rundy',
    minOption: '{n} min',
    roundOption_one: '{n} runda',
    roundOption_few: '{n} rundy',
    roundOption_many: '{n} rund',
    estimateTime:
      'Około {cycles} pełnych cykli oddechowych w ~{minutes} min (kończy się na końcu cyklu).',
    estimateRounds: '{rounds} rund — około {minutes}+ min (czas wstrzymywania się różni).',
    estimateRoundsVary: '{rounds} rund — czas wstrzymywania zależy od tempa.',
    soundCues: 'Dźwięk przy zmianie fazy',
    vibration: 'Wibracja przy zmianie fazy',
    showCountdown: 'Pokaż odliczanie numeryczne',
    cueVolume: 'Głośność sygnałów',
    viewSafety: 'Pełne informacje o bezpieczeństwie',
    start: 'Start'
  },
  exercise: {
    stop: 'Stop',
    stopAria: 'Awaryjne zatrzymanie — natychmiast zakończ sesję',
    pauseAria: 'Wstrzymaj sesję',
    inhale: 'Wdech',
    holdTap: 'Wstrzymaj oddech. Dotknij, gdy poczujesz potrzebę oddychania.',
    needToBreathe: 'Muszę oddychać',
    getReady: 'Przygotuj się',
    skip: 'Pomiń',
    paused: 'Wstrzymano',
    pausedBackground: 'Wstrzymano — powrót z tła',
    resume: 'Wznów',
    endSession: 'Zakończ sesję',
    roundOf: 'Runda {current} z {total}',
    left: 'Pozostało {time}',
    next: 'Następne: {phase}',
    nextRecoveryInhale: 'Następne: Oddech regeneracyjny',
    startingWith: 'Zaczynasz od: {phase}',
    sessionStarted: 'Sesja rozpoczęta. {phase}',
    seconds: '{label}, {count} sekund',
    pausedSr: 'Wstrzymano.',
    pausedBackgroundSr: 'Wstrzymano. Powrót z tła.',
    resumedSr: 'Wznowiono.'
  },
  completion: {
    done: 'Gotowe',
    sessionComplete: 'Sesja zakończona.',
    optionalNote: 'Opcjonalna notatka',
    notePlaceholder: 'Jak czuła się ta sesja?',
    saveFinish: 'Zapisz i zakończ',
    practiceAgain: 'Ćwicz ponownie',
    backToList: 'Wróć do listy',
    elapsed: 'Czas trwania',
    technique: 'Technika',
    rounds: 'Rundy',
    cycles: 'Cykle'
  },
  history: {
    title: 'Historia',
    backAria: 'Wróć do technik',
    noSessions: 'Brak ukończonych sesji.',
    empty: 'Ukończone sesje pojawią się tutaj. Niezakończone sesje nie są zapisywane.',
    exportJson: 'Eksportuj JSON',
    deleteAll: 'Usuń całą historię',
    sessionFallback: 'Sesja',
    recentSaved: 'Twoje ostatnie sesje są tu zapisywane po zakończeniu ćwiczenia.',
    sessionsThisWeek_one: '1 ukończona sesja w tym tygodniu.',
    sessionsThisWeek_few: '{count} ukończone sesje w tym tygodniu.',
    sessionsThisWeek_many: '{count} ukończonych sesji w tym tygodniu.',
    confirmDelete: 'Usunąć całą historię sesji na tym urządzeniu?'
  },
  settings: {
    title: 'Ustawienia',
    backAria: 'Wróć do technik',
    sessionPrefs: 'Preferencje sesji',
    language: 'Język',
    theme: 'Motyw',
    diagnostics: 'Diagnostyka',
    showOnboarding: 'Pokaż wprowadzenie ponownie',
    privacyData: 'Prywatność i dane',
    privacyText:
      'Wszystkie preferencje i historia pozostają na tym urządzeniu. Nic nie jest wysyłane na serwer. Zobacz <a href="docs/privacy.md" id="settings-privacy-link">szczegóły prywatności</a>.',
    clearData: 'Wyczyść preferencje i historię',
    soundCues: 'Dźwięki',
    vibration: 'Wibracja',
    countdown: 'Odliczanie numeryczne',
    cueVolume: 'Głośność sygnałów',
    confirmClear: 'Wyczyścić preferencje i historię na tym urządzeniu?',
    langEn: 'English',
    langPl: 'Polski'
  },
  diagnostics: {
    appVersion: 'Wersja aplikacji',
    online: 'Online',
    serviceWorker: 'Service worker',
    wakeLock: 'Blokada wygaszania',
    audio: 'Audio',
    lastError: 'Ostatni błąd',
    yes: 'Tak',
    no: 'Nie',
    supported: 'Obsługiwane',
    unavailable: 'Niedostępne',
    ready: 'Gotowe',
    error: 'Błąd',
    none: 'Brak'
  },
  pwa: {
    installed: 'Zainstalowana',
    offlineNow: 'Offline',
    readyOffline: 'Gotowa offline',
    preparingOffline: 'Przygotowywanie trybu offline…',
    updateAvailable: 'Dostępna aktualizacja',
    offlineSetupFailed: 'Konfiguracja offline nie powiodła się'
  },
  onboarding: {
    title: 'Witaj w Oddech',
    step1: 'Ćwicz siedząc lub leżąc. Przerwij, jeśli źle się czujesz.',
    step2:
      'Koło rozszerza się przy wdechu i kurczy przy wydechu. Dźwięk i wibracja są opcjonalne.',
    step3: 'Otwórz technikę, aby zobaczyć instrukcje, wybierz czas trwania i rozpocznij.',
    step4: 'Po pierwszej wizycie online aplikacja działa offline na tym urządzeniu.',
    dismiss: 'Rozpocznij'
  },
  abandon: {
    title: 'Zakończyć sesję?',
    desc: 'Postęp w tej sesji nie zostanie zapisany.',
    keepGoing: 'Kontynuuj',
    endSession: 'Zakończ sesję'
  },
  safety: {
    modalTitle: 'Informacje o bezpieczeństwie',
    generalGuidance: 'Ogólne wskazówki',
    highIntensity: 'Techniki o wysokiej intensywności',
    ack: 'Rozumiem te zasady bezpieczeństwa i przerwę, jeśli źle się poczuję',
    close: 'Zamknij',
    continueSession: 'Kontynuuj do sesji',
    wellnessDisclaimer:
      'Praca z oddechem to praktyka wellness, a nie leczenie medyczne. Ta aplikacja nie diagnozuje, nie leczy ani nie zapobiega żadnym schorzeniom. Skonsultuj się z lekarzem przed rozpoczęciem, jeśli masz obawy zdrowotne.',
    globalGuidance: [
      'Ćwicz siedząc lub leżąc w bezpiecznym, wygodnym miejscu.',
      'Nie ćwicz w wodzie, pod prysznicem ani podczas prowadzenia pojazdu lub obsługi maszyn.',
      'Nigdy nie wymuszaj oddechu ani wstrzymywania. Oddychaj w tempie, które jest dla Ciebie komfortowe.',
      'Przerwij i odpocznij, jeśli czujesz zawroty głowy, osłabienie, mrowienie, nudności lub dyskomfort.'
    ],
    highIntensityExtra: [
      'Techniki o wysokiej intensywności wykorzystują szybki oddech i wstrzymywanie. Nie są odpowiednie dla każdego.',
      'Nie ćwicz, jeśli jesteś w ciąży lub masz padaczkę, choroby serca, wysokie ciśnienie, jaskrę, historię ataków paniki lub inne poważne schorzenia — chyba że lekarz wyraźnie to zezwolił.',
      'Skonsultuj się z lekarzem przed pierwszą sesją, jeśli nie masz pewności, czy te techniki są dla Ciebie odpowiednie.'
    ],
    techniqueWarnings: {
      'wim-hof': {
        title: 'Oddech w stylu Wim Hof',
        points: [
          'Wykorzystuje szybkie głębokie oddechy, po których następuje wstrzymanie po wydechu, a potem oddech regeneracyjny z wstrzymaniem.',
          'Oficjalne wskazówki Wim Hof zalecają nie ćwiczyć w wodzie, pod prysznicem ani podczas prowadzenia pojazdu.',
          'Ta aplikacja jest inspirowana ćwiczeniami oddechowymi spopularyzowanymi przez Wim Hof. Nie jest powiązana ani wspierana przez Wim Hof Method.',
          'Natychmiast przerwij, jeśli czujesz osłabienie, mrowienie lub dyskomfort. Wróć do normalnego oddychania i odpocznij.'
        ],
        attribution:
          'Wim Hof Method to zastrzeżone podejście; użycie nazwy tutaj ma charakter opisowy.'
      },
      bhastrika: {
        title: 'Bhastrika (oddech miechowy)',
        points: [
          'Wykorzystuje szybkie, energiczne wdechy i wydechy, po których następuje wstrzymanie oddechu.',
          'Może szybko pobudzić, ale także powodować zawroty głowy lub osłabienie.',
          'Niezalecane w ciąży oraz przy padaczce, chorobach serca lub płuc, wysokim ciśnieniu lub po niedawnej operacji — chyba że lekarz wyraźnie to zezwolił.',
          'Natychmiast przerwij, jeśli czujesz osłabienie lub dyskomfort. Wróć do normalnego oddychania i odpocznij.'
        ]
      }
    }
  },
  audio: {
    couldNotStart: 'Nie udało się uruchomić dźwięku na tym urządzeniu.'
  },
  continueDetail: {
    min: '{name} · {n} min',
    rounds: '{name} · {n} rund'
  },
  storedKeys: [
    {
      key: 'breathwork_prefs_v2',
      description: 'Preferencje aplikacji, ulubione i ostatnie ustawienia sesji'
    },
    {
      key: 'breathwork_history_v1',
      description: 'Historia ukończonych sesji (technika, czas trwania, notatki)'
    },
    { key: 'breathwork_safety_ack_v1', description: 'Flaga potwierdzenia bezpieczeństwa' },
    { key: 'breathwork_install_hint_dismissed', description: 'Flaga zamknięcia podpowiedzi instalacji' },
    { key: 'breathwork_offline_ready', description: 'Flaga gotowości trybu offline' }
  ],
  techniques: {
    box: {
      name: 'Oddech pudełkowy',
      shortDescription: 'Ostry stres, spokój przed spotkaniem, reset między zadaniami',
      metadata: { typicalSession: '5–15 min' },
      instructions: {
        posture: 'Usiądź prosto z podparciem pleców, rozluźnionymi ramionami i stopami płasko na podłodze.',
        steps: [
          'Wdychaj powoli przez nos przez cztery rytmy.',
          'Delikatnie wstrzymaj oddech przez cztery rytmy — bez wysiłku.',
          'Wydychaj płynnie przez nos lub usta przez cztery rytmy.',
          'Wstrzymaj z pustymi płucami przez cztery rytmy, potem powtórz.'
        ],
        phaseSequence: 'Wdech 4s → Wstrzymaj 4s → Wydech 4s → Wstrzymaj pusty 4s',
        sensations: 'Stabilny, uziemiający rytm, który może pomóc uspokoić gonitwę myśli.',
        notes: 'Każda faza powinna być komfortowa. Skróć rytm, jeśli cztery sekundy to za dużo.'
      },
      phases: [
        { label: 'Wdech' },
        { label: 'Wstrzymaj' },
        { label: 'Wydech' },
        { label: 'Wstrzymaj' }
      ]
    },
    '4-7-8': {
      name: 'Oddech 4-7-8',
      shortDescription: 'Zasypianie, wieczorny spokój, wyciszenie aktywnego umysłu',
      metadata: { typicalSession: '5–15 min' },
      instructions: {
        posture:
          'Usiądź lub połóż się wygodnie. Jeśli to naturalne, umieść czubek języka za górnymi zębami.',
        steps: [
          'Wydychaj całkowicie przez usta z cichym szumem.',
          'Zamknij usta i wdychaj cicho przez nos przez cztery rytmy.',
          'Wstrzymaj oddech przez siedem rytmów bez napinania ciała.',
          'Wydychaj w pełni przez usta przez osiem rytmów, potem powtórz cykl.'
        ],
        phaseSequence: 'Wdech 4s → Wstrzymaj 7s → Wydech 8s',
        sensations: 'Zwolnione tempo, które wielu ludzi uważa za pomocne przed snem.',
        notes: 'Wydech jest dłuższy niż wdech. Nigdy nie wymuszaj wstrzymywania.'
      },
      phases: [{ label: 'Wdech' }, { label: 'Wstrzymaj' }, { label: 'Wydech' }]
    },
    'physiological-sigh': {
      name: 'Westchnienie fizjologiczne',
      shortDescription: 'Nagły stres, emocjonalne przytłoczenie, szybki reset układu nerwowego',
      metadata: { typicalSession: '1–3 min (3–8 rund)' },
      instructions: {
        posture: 'Usiądź lub stań wygodnie. Rozluźnij szczękę i ramiona.',
        steps: [
          'Weź pełny wdech przez nos, aż płuca będą w większości wypełnione.',
          'Bez wydychania weź drugi, krótszy łyk powietrza przez nos, aby w pełni rozszerzyć płuca.',
          'Wydychaj powoli i całkowicie przez usta, aż do opróżnienia.',
          'Zatrzymaj się na chwilę, potem powtórz wybraną liczbę rund.'
        ],
        phaseSequence: 'Wdech → Drugi wdech → Długi wydech',
        sensations: 'Szybki reset — często wystarczą jedna do trzech rund.',
        notes: 'Drugi wdech jest krótki i delikatny, nie gwałtownym łykiem powietrza.'
      },
      phases: [
        { label: 'Wdech' },
        { label: 'Wdech ponownie' },
        { label: 'Wolny wydech' }
      ]
    },
    'wim-hof': {
      name: 'Metoda Wim Hof',
      shortDescription: 'Pobudzająca praca z oddechem, czujność, energia gdy jesteś ospały',
      metadata: { typicalSession: '10–20 min (3–5 rund)' },
      instructions: {
        posture: 'Usiądź lub połóż się w bezpiecznym miejscu — nigdy w wodzie, pod prysznicem ani podczas jazdy.',
        steps: [
          'Weź 30 głębokich oddechów: pełny wdech, rozluźniony wydech — podążaj za szybkim rytmem w aplikacji.',
          'Po 30. wydechu pozostaw płuca puste i wstrzymaj, aż poczujesz potrzebę oddychania.',
          'Dotknij „Muszę oddychać", gdy będziesz gotowy, potem weź głęboki oddech regeneracyjny i wstrzymaj około 15 sekund.',
          'Wydychaj i odpocznij chwilę przed następną rundą.'
        ],
        phaseSequence: '30 oddechów → Wstrzymanie po wydechu (dotknij, gdy gotowy) → Oddech regeneracyjny + wstrzymanie',
        sensations: 'Mrowienie, zawroty głowy lub ciepło są częste. Przerwij, jeśli źle się czujesz.',
        notes: 'Ćwicz tylko siedząc lub leżąc. Przeczytaj wszystkie informacje o bezpieczeństwie przed rozpoczęciem.'
      },
      phases: [{ label: 'Wdech' }, { label: 'Puść' }],
      holdAfterExhaleLabel: 'Wstrzymaj (wydech)',
      inhaleHoldLabel: 'Wdech i wstrzymaj'
    },
    coherent: {
      name: 'Oddech spójny',
      shortDescription: 'Codzienny spokój, stały rytm, długotrwała ulga w stresie',
      metadata: { typicalSession: '10–20 min' },
      instructions: {
        posture: 'Usiądź wygodnie z lekką, wyprostowaną postawą.',
        steps: [
          'Wdychaj przez nos przez około pięć i pół sekundy.',
          'Wydychaj przez nos przez około pięć i pół sekundy.',
          'Utrzymuj płynny rytm bez pauzy między wdechem a wydechem.',
          'Pozwól brzuchowi i klatce poruszać się naturalnie — nie wymuszaj objętości.'
        ],
        phaseSequence: 'Wdech 5,5s → Wydech 5,5s',
        sensations: 'Gładka, równomierna fala oddechu wspierająca codzienny spokój.',
        notes: 'Komfort jest ważniejszy niż precyzja — timing w aplikacji to delikatny przewodnik.'
      },
      phases: [{ label: 'Wdech' }, { label: 'Wydech' }]
    },
    'alternate-nostril': {
      name: 'Oddech naprzemienny przez nozdrza',
      shortDescription: 'Jasność umysłu, równowaga emocjonalna, reset w ciągu dnia',
      metadata: { typicalSession: '5–10 min' },
      instructions: {
        posture: 'Usiądź prosto z lewą dłonią na kolanie. Prawą dłoń przyłóż do nosa.',
        steps: [
          'Kciukiem prawej dłoni delikatnie zamknij prawe nozdrze.',
          'Wdychaj powoli przez lewe nozdrze.',
          'Zamknij oba nozdrza na chwilę kciukiem i palcem serdecznym, potem otwórz prawe i wydychaj przez prawe.',
          'Wdychaj przez prawe nozdrze, zamknij oba, potem wydychaj przez lewe. To jedna runda.',
          'Aplikacja oznacza każdą fazę — podążaj za wskazówkami nozdrzy na ekranie.'
        ],
        phaseSequence:
          'Wdech lewy → Wstrzymaj → Wydech prawy → Wdech prawy → Wstrzymaj → Wydech lewy',
        sensations: 'Zrównoważony, skupiony oddech. Ta technika wymaga kontroli nozdrzy.',
        notes: 'Używaj lekkiego nacisku na nozdrza — nigdy nie blokuj tak mocno, żeby bolało.'
      },
      phases: [
        { label: 'Lewe – Wdech' },
        { label: 'Wstrzymaj' },
        { label: 'Prawe – Wydech' },
        { label: 'Prawe – Wdech' },
        { label: 'Wstrzymaj' },
        { label: 'Lewe – Wydech' }
      ]
    },
    bhastrika: {
      name: 'Bhastrika',
      shortDescription: 'Niski poziom energii, leniwe poranki, przed aktywnością fizyczną',
      metadata: { typicalSession: '5–15 min (3–5 rund)' },
      instructions: {
        posture: 'Usiądź prosto ze stabilną podstawą. Trzymaj kręgosłup wyprostowany, brzuch swobodny.',
        steps: [
          'Wykonuj szybkie, energiczne oddechy przez nos: aktywny wdech i aktywny wydech — jak miech.',
          'Wykonaj 30 oddechów na rundę w rytmie aplikacji.',
          'Po ostatnim wydechu wstrzymaj z pustymi płucami, aż poczujesz potrzebę powietrza, potem dotknij, aby kontynuować.',
          'Weź oddech regeneracyjny i wstrzymaj, potem odpocznij przed następną rundą.'
        ],
        phaseSequence: '30 szybkich oddechów → Wstrzymanie po wydechu (dotknij) → Oddech regeneracyjny + wstrzymanie',
        sensations: 'Ciepło, mrowienie lub energia są częste. Natychmiast przerwij przy zawrotach głowy lub nudnościach.',
        notes: 'Nie dla początkujących ani osób z chorobami serca, układu oddechowego lub w ciąży.'
      },
      phases: [{ label: 'Wdech' }, { label: 'Wydech' }],
      holdAfterExhaleLabel: 'Wstrzymaj',
      inhaleHoldLabel: 'Wdech i wstrzymaj'
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N_PL: I18N_PL };
}
