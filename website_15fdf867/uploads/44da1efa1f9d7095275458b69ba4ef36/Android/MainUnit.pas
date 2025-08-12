
unit MainUnit;

interface

uses
  System.SysUtils, System.Types, System.UITypes, System.Classes,
  System.Variants,
  FMX.Types, FMX.Controls, FMX.Forms, FMX.Graphics, FMX.Dialogs,
  FMX.Controls.Presentation, FMX.StdCtrls, FMX.Layouts;

type
  TFrmMain = class(TForm)
    ScrollBox1: TScrollBox;
    
    BtnCredits: TButton;

    BtnClients: TButton;

    procedure BtnCreditsClick(Sender: TObject);

    procedure BtnClientsClick(Sender: TObject);
    
  private
    { Private declarations }
  public
    { Public declarations }
  end;
var
  FrmMain: TFrmMain;

implementation

{$R *.fmx}

uses CreditsUnit, ClientsUnit;

procedure TFrmMain.BtnCreditsClick(Sender: TObject);
begin
  With TFrmCredits.Create(Self) do
    begin
      Show;    
    end;
end;


procedure TFrmMain.BtnClientsClick(Sender: TObject);
begin
  With TFrmClients.Create(Self) do
    begin
      Show;    
    end;
end;



end.
