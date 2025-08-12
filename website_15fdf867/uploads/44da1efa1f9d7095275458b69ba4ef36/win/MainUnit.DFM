
object FrmMain: TFrmMain
  Left = 0
  Top = 0
  Caption = 'Main'
  ClientHeight = 676
  ClientWidth = 891
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  Position = poScreenCenter
  PixelsPerInch = 96
  TextHeight = 13
  object ScrollBox1: TScrollBox
    Left = 0
    Top = 0
    Width = 185
    Height = 676
    Align = alLeft
    TabOrder = 0
    OnMouseWheel = ScrollBox1MouseWheel
    
    object BtnCredits: TButton
      AlignWithMargins = True
      Left = 3
      Top = 3
      Width = 175
      Height = 25
      Align = alTop
      Caption = 'Credits'
      TabOrder = 0
      OnClick = BtnCreditsClick
      ExplicitLeft = -3
      ExplicitTop = -2
      ExplicitWidth = 181
    end
 

    object BtnClients: TButton
      AlignWithMargins = True
      Left = 3
      Top = 3
      Width = 175
      Height = 25
      Align = alTop
      Caption = 'Clients'
      TabOrder = 0
      OnClick = BtnClientsClick
      ExplicitLeft = -3
      ExplicitTop = -2
      ExplicitWidth = 181
    end
 

  end
end

