
unit ItemClientUnit;

interface

uses
  System.SysUtils, System.Types, System.UITypes, System.Classes,
  System.Variants,
  FMX.Types, FMX.Graphics, FMX.Controls, FMX.Forms, FMX.Dialogs, FMX.StdCtrls,
  FMX.Objects, FMX.Controls.Presentation, FMX.Layouts;

type
  TItemClient = class(TFrame)
    LayName: TLayout;
LayAge: TLayout;
LayImg: TLayout;

    LbName: TLabel;
LbAge: TLabel;
LbImg: TLabel;

    RectPlatForm: TRectangle;
    RecEdit: TRectangle;
    RecDelete: TRectangle;
    LayEdit: TLayout;
    LayDelete: TLayout;
    procedure RecDeleteClick(Sender: TObject);
    procedure RecEditClick(Sender: TObject);
  private
    { Private declarations }
    FID: string;
    FIsSelected: Boolean;
    procedure SetIsSelected(const Value: Boolean);
    procedure DeleteClient;
    procedure EditClient;
    { Private declarations }
  public
    constructor Create(AOwner: TComponent); override;
    Destructor Destroy; override;
    property IsSelected: Boolean read FIsSelected write SetIsSelected;
    property ID: string read FID write FID;

  var
    LoadData: Procedure of object;
    ShowDetail: Procedure(aID: string) of object;
  end;

implementation

{$R *.fmx}
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

uses ControllerClient, Consts, ClientsUnit, DMUnit;
{ TItemClient }

constructor TItemClient.Create(AOwner: TComponent);
begin
  inherited;  
end;

procedure TItemClient.DeleteClient;
var
  IsDeleted: Boolean;
begin

  with TClient.Create(ID) do
    try
      IsDeleted := Delete;
    finally
      Free;
    end;
  if IsDeleted then
    DM.GS.ProcThrd(LoadData);
end;

destructor TItemClient.Destroy;
begin
  inherited;
end;

procedure TItemClient.EditClient;
begin
  ShowDetail(FID);
end;

procedure TItemClient.RecDeleteClick(Sender: TObject);
begin
  DeleteClient;
end;

procedure TItemClient.RecEditClick(Sender: TObject);
begin
  EditClient;
end;

procedure TItemClient.SetIsSelected(const Value: Boolean);
begin
  FIsSelected := Value;
  if FIsSelected then
  begin
    RectPlatForm.Fill.Color := $FFA4B197;
  end
  else
  begin
    RectPlatForm.Fill.Color := FrmClients.aColor_Item; // Color_Item;
  end;

end;

end.

