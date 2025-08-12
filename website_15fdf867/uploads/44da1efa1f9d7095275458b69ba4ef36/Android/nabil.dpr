
program nabil;

uses
  System.StartUpCopy,FMX.Forms,
  Consts in 'Consts.pas',
  Controllers in 'Controllers.pas',
  DMUnit in 'DMUnit.pas' {DM: TDataModule},
  MainUnit in 'MainUnit.pas' {FrmMain},
  FrameListBoxItem in 'Library\\FrameListBoxItem.pas' ,
  
  ControllerCredit in 'Credits\\ControllerCredit.pas',
  ItemCreditUnit in 'Credits\\ItemCreditUnit.pas' {ItemCredit: TFrame},
  CreditsUnit in 'Credits\\CreditsUnit.pas' {FrmCredits}
  ,

  ControllerClient in 'Clients\\ControllerClient.pas',
  ItemClientUnit in 'Clients\\ItemClientUnit.pas' {ItemClient: TFrame},
  ClientsUnit in 'Clients\\ClientsUnit.pas' {FrmClients}
  ;


{$R *.res}

begin
  Application.Initialize;  
  Application.CreateForm(TDM, DM);
  Application.CreateForm(TFrmMain, FrmMain);
  Application.Run;
end.
