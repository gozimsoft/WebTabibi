
 object DM: TDM
  OnCreate = DataModuleCreate
  OnDestroy = DataModuleDestroy
  Height = 436
  Width = 538
  object FDGUIxWaitCursor1: TFDGUIxWaitCursor
    Provider = 'FMX'
    Left = 96
    Top = 280
  end
  object RTLFixer1: TRTLFixer
    ArabicDigits = True
    DigitTypes = ArabicDigitType1
    MathOrder = LeftToRight
    Options = []
    Left = 395
    Top = 168
  end
  object GS: TGS
    Left = 304
    Top = 181
  end
  object UniConnection: TUniConnection
    ProviderName = 'SQLite'
    SpecificOptions.Strings = ('SQLite.Direct=True')
    LoginPrompt = False
    Left = 384
    Top = 264
  end
  object MySQLUniProvider1: TMySQLUniProvider
    Left = 224
    Top = 200
  end
  object SQLiteUniProvider1: TSQLiteUniProvider
    Left = 304
    Top = 328
  end
  object SQLServerUniProvider1: TSQLServerUniProvider
    Left = 160
    Top = 360
  end
end
