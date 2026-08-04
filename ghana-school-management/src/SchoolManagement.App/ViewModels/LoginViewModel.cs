using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SchoolManagement.Core.Domain;
using SchoolManagement.Services;

namespace SchoolManagement.App.ViewModels;

/// <summary>MVVM login flow: authenticates against <see cref="AuthService"/> and exposes the signed-in role.</summary>
public partial class LoginViewModel : ObservableObject
{
    private readonly AuthService _auth;

    public LoginViewModel(AuthService auth) => _auth = auth;

    [ObservableProperty]
    private string _username = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    [ObservableProperty]
    private string? _errorMessage;

    [ObservableProperty]
    private bool _isBusy;

    public User? SignedInUser { get; private set; }

    public event EventHandler<User>? LoginSucceeded;

    [RelayCommand]
    private async Task LoginAsync()
    {
        ErrorMessage = null;
        IsBusy = true;
        try
        {
            var result = await _auth.LoginAsync(Username.Trim(), Password);
            if (!result.Success)
            {
                ErrorMessage = result.Error;
                return;
            }

            SignedInUser = result.User;
            LoginSucceeded?.Invoke(this, result.User!);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
