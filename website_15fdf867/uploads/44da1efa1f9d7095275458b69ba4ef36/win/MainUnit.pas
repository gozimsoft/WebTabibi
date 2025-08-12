
unit MainUnit;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants,
  System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls;

type
  TFrmMain = class(TForm)
    ScrollBox1: TScrollBox;
    
    BtnCredits: TButton;

    BtnClients: TButton;


    procedure BtnCreditsClick(Sender: TObject);

    procedure BtnClientsClick(Sender: TObject);

    procedure ScrollBox1MouseWheel(Sender: TObject; Shift: TShiftState;
      WheelDelta: Integer; MousePos: TPoint; var Handled: Boolean);
  private
    { Private declarations }
  public
    { Public declarations }
  end;
var
  FrmMain: TFrmMain;

implementation

{$R *.dfm}

uses CreditsUnit, ClientsUnit;


procedure TFrmMain.BtnCreditsClick(Sender: TObject);
begin
  With TFrmCredits.Create(Self) do
    try
      ShowModal;
    finally
      Free;
    end;
end;


procedure TFrmMain.BtnClientsClick(Sender: TObject);
begin
  With TFrmClients.Create(Self) do
    try
      ShowModal;
    finally
      Free;
    end;
end;



procedure TFrmMain.ScrollBox1MouseWheel(Sender: TObject; Shift: TShiftState;
  WheelDelta: Integer; MousePos: TPoint; var Handled: Boolean);
begin
  if WheelDelta > 0 then
    TScrollBox(Sender).VertScrollBar.Position := TScrollBox(Sender)
      .VertScrollBar.Position - 10
  else
    TScrollBox(Sender).VertScrollBar.Position := TScrollBox(Sender)
      .VertScrollBar.Position + 10;
  Handled := true;
end;

end.
