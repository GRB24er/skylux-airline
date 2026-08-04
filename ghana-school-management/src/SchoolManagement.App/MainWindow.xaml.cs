using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;

namespace SchoolManagement.App;

/// <summary>
/// Shell window: left navigation with one entry per module. Pages are added per
/// role after login — the role-permission map in
/// <see cref="Services.Permissions"/> decides which items are visible.
/// </summary>
public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void NavView_SelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
    {
        // Page navigation is wired up as views are implemented:
        // ContentFrame.Navigate(typeof(DashboardPage)) etc., keyed on the item Tag.
    }
}
