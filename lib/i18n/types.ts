/** i18n type definitions for bilingual support (vi/en). */

export type Locale = "vi" | "en";

export type TranslationKeys = {
  // Common
  common: {
    appName: string;
    appDescription: string;
    loading: string;
    processing: string;
    saving: string;
    error: string;
    tryAgain: string;
    delete: string;
    update: string;
    back: string;
    admin: string;
    email: string;
    password: string;
  };

  // Status labels
  status: {
    draft: string;
    live: string;
    paused: string;
    ended: string;
    hidden: string;
    clueVisible: string;
    answerRevealed: string;
  };

  // Viewer
  viewer: {
    questions: string;
    keyword: string;
    updates: string;
    chars: string;
    noQuestionsYet: string;
    programStartingSoon: string;
    footer: string;
    aboutToStart: string;
    happening: string;
    boardTitle: string;
    boardSubtitle: string;
    announcementLabel: string;
    updatesSubtitle: string;
    noUpdatesYet: string;
    activeQuestion: string;
    finalKeywordReady: string;
    eventGameStarted: string;
    eventGamePaused: string;
    eventGameResumed: string;
    eventGameEnded: string;
    eventClueOpened: string;
    eventAnswerRevealed: string;
    eventRowAdvanced: string;
  };

  // Admin common
  admin: {
    headerTitle: string;
    login: string;
    signingIn: string;
    signIn: string;
    programsList: string;
    createNew: string;
    noProgramsYet: string;
    createFirstProgram: string;
    createProgram: string;
    createNewProgram: string;
    backToList: string;
  };

  // Admin: Program form
  programForm: {
    nameLabel: string;
    namePlaceholder: string;
    slugLabel: string;
    slugPlaceholder: string;
    slugHelp: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    imageLabel: string;
    imageHelp: string;
    currentImage: string;
    imagePreviewAlt: string;
  };

  // Admin: Program status
  programStatus: {
    currentStatus: string;
    publish: string;
    end: string;
    toDraft: string;
    confirmDelete: string;
  };

  // Admin: Game
  game: {
    noGameYet: string;
    createFirstGame: string;
    gameNamePlaceholder: string;
    finalKeywordOptional: string;
    creating: string;
    createGame: string;
    controlPanel: string;
    eventHistory: string;
    noEventsYet: string;
    statusLabel: string;
    currentQuestion: string;
    startGame: string;
    openQuestion: string;
    showAnswer: string;
    nextQuestion: string;
    pause: string;
    endGame: string;
    resume: string;
    resetGame: string;
    announcement: string;
    announcementPlaceholder: string;
    questionsOverview: string;
    opened: string;
  };

  // Admin: Rows
  rows: {
    questionsTitle: string;
    noGameCreateFirst: string;
    createGameBeforeQuestions: string;
    backToOverview: string;
    finalKeyword: string;
    questionsList: string;
    noQuestionsAddRight: string;
    addQuestion: string;
    questionLabel: string;
    questionPlaceholder: string;
    answerLabel: string;
    answerPlaceholder: string;
    selectHighlight: string;
    selected: string;
    notSelected: string;
    noteOptional: string;
    notePlaceholder: string;
    adding: string;
    addQuestionNum: string;
    deleteQuestion: string;
    note: string;
  };

  // Admin: Theme
  theme: {
    themeTitle: string;
    editTheme: string;
    createNewTheme: string;
    colorPreview: string;
    nameLabel: string;
    namePlaceholder: string;
    primary: string;
    secondary: string;
    accent: string;
    overlayOpacity: string;
    savedSuccess: string;
    updateTheme: string;
    createTheme: string;
  };

  // Admin: Program detail page
  programDetail: {
    overview: string;
    themeTab: string;
    questionsTab: string;
    gameControl: string;
    programInfo: string;
    statusLabel: string;
    crosswordGame: string;
    gameStatusInfo: string;
    manageQuestions: string;
    viewerLink: string;
  };

  // Pages
  pages: {
    homeSubtitle: string;
    notFoundTitle: string;
    notFoundMessage: string;
    backToHome: string;
    adminError: string;
    adminErrorMessage: string;
    errorOccurred: string;
    unexpectedError: string;
    noGame: string;
    createGameBeforeControl: string;
  };
};

export type Translations = Record<Locale, TranslationKeys>;
