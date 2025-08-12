
unit DetailClientUnit;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants,
  System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls, Vcl.ExtCtrls,
  FireDAC.VCLUI.Controls , Vcl.ComCtrls , Vcl.ExtDlgs ,cxButtons  ;
type
  TFrmDetailClient = class(TForm)
    Timer1: TTimer;    
	LbWinTitle: TLabel;
	SBPlatForm: TScrollBox;
    BtnSave: TcxButton;
    BtnCancel: TcxButton;	
     PaName: TPanel;  
 EdName: TEdit; 

 PaAge: TPanel;  
 EdAge: TEdit; 

 PaImg: TPanel;  
 ImImg: TImage; 
 BtnEmptyImg: TcxButton; 


     procedure BtnEmptyImgClick(Sender: TObject);
 procedure ImImgClick(Sender: TObject);
    
	
    procedure Timer1Timer(Sender: TObject);
    procedure BtnSaveClick(Sender: TObject);
    procedure BtnCancelClick(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
	procedure SBPlatFormMouseWheel(Sender: TObject; Shift: TShiftState;
              WheelDelta: Integer; MousePos: TPoint; var Handled: Boolean);
  private
    
    function IsDataCurrect: Boolean;
    procedure LoadClient;
    function SaveClient: Boolean;
  public
  Var
    ID: string;
  end;

var
  FrmDetailClient: TFrmDetailClient;

implementation

{$R *.dfm}
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

uses DmUnit, ControllerClient    ;
procedure TFrmDetailClient.SBPlatFormMouseWheel(Sender: TObject; Shift: TShiftState;
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

procedure TFrmDetailClient.BtnSaveClick(Sender: TObject);
begin
  if SaveClient then
    ModalResult := mrOk;
end;

procedure TFrmDetailClient.BtnCancelClick(Sender: TObject);
begin
  ModalResult := mrCancel;
end;
procedure TFrmDetailClient.FormDestroy(Sender: TObject);
begin
  // free

end;
procedure TFrmDetailClient.FormShow(Sender: TObject);
begin
 
  LoadClient;
end;

function TFrmDetailClient.IsDataCurrect: Boolean;
begin
//  Result := False;
//  if DM.GS.IsNotEmpty(EdName.Text) then
    Result := True;
end;

procedure TFrmDetailClient.LoadClient;
begin
  with TClient.Create(ID) do
    try
       EdName.Text := Name; 
Name := EdName.Text ; 
 EdAge.Text := (Age).tostring ; 
Age := Strtoint(EdAge.Text) ; 
 ImImg.Picture.LoadFromStream(Img);
 ImImg.Picture.SaveToStream(Img);

    finally
      Free;
    end;
end;

function TFrmDetailClient.SaveClient: Boolean;
begin
  with TClient.Create(ID) do
    try
      
      Result := Save;
    finally
      Free;
    end;
end;

procedure TFrmDetailClient.Timer1Timer(Sender: TObject);
begin
  BtnSave.Enabled := IsDataCurrect;
end;


procedure TFrmDetailClient.BtnEmptyImgClick(Sender: TObject);
begin
  ImImg.Picture.assign(nil);
end;



procedure TFrmDetailClient.ImImgClick(Sender: TObject);
begin
  with TOpenPictureDialog.Create(Self) do
    try
      if Execute then
        if FileName <> EmptyStr then
        begin
          ImImg.Picture.LoadFromFile(FileName);
        end;
    finally
      Free;
    end;
end;





end.
