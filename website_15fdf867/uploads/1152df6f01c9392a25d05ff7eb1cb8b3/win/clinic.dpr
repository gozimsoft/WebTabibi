
program clinic;

uses
  Vcl.Forms,
  Consts in 'Consts.pas',
  Controllers in 'Controllers.pas',
  DMUnit in 'DMUnit.pas' {DM: TDataModule},
  MainUnit in 'MainUnit.pas' {FrmMain},
  DetailCreditUnit in 'Credits\\DetailCreditUnit.pas' {FrmDetailCredit},
  ControllerCredit in 'Credits\\ControllerCredit.pas',
  CreditsUnit in 'Credits\\CreditsUnit.pas' {FrmCredits}, 
DetailClientUnit in 'Clients\\DetailClientUnit.pas' {FrmDetailClient},
  ControllerClient in 'Clients\\ControllerClient.pas',
  ClientsUnit in 'Clients\\ClientsUnit.pas' {FrmClients};


{$R *.res}

begin
  Application.Initialize;
  Application.MainFormOnTaskbar := True;
  Application.CreateForm(TDM, DM);
  Application.CreateForm(TFrmMain, FrmMain);
  Application.Run;
end.
