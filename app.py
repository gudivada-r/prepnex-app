import streamlit as st
import pandas as pd
from datetime import datetime
from fetch_grants import fetch_education_grants

# Set page config
st.set_page_config(page_title="Higher Ed Funding Tracker", layout="wide")

# Custom CSS for better aesthetics
st.markdown("""
<style>
    .main {
        background-color: #f0f2f6;
    }
    .stButton>button {
        color: white;
        background-color: #0066cc;
        border-radius: 5px;
    }
    h1 {
        color: #1f2937;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box_shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

st.title("🎓 Higher Ed Funding Tracker")
st.markdown("Monitor the latest Department of Education grant opportunities and simulate potential funding impact.")

# --- Sidebar for Simulation ---
st.sidebar.header("💰 Funding Simulator")
st.sidebar.markdown("Estimate your potential revenue based on these opportunities.")

avg_grant_value = st.sidebar.number_input(
    "Average Grant Value ($)", 
    min_value=1000, 
    value=500000, 
    step=10000,
    format="%d"
)

win_prob = st.sidebar.slider(
    "Win Probability (%)", 
    min_value=0, 
    max_value=100, 
    value=15
)

# --- Data Fetching Section ---
st.header("Latest Education Grants")

if st.button("Refresh Data", type="primary"):
    with st.spinner("Fetching latest grants from Grants.gov..."):
        grants = fetch_education_grants()
        st.session_state['grants'] = grants
        st.session_state['last_updated'] = datetime.now()
elif 'grants' not in st.session_state:
    # Initial load
    with st.spinner("Fetching latest grants from Grants.gov..."):
        grants = fetch_education_grants()
        st.session_state['grants'] = grants
        st.session_state['last_updated'] = datetime.now()

if 'last_updated' in st.session_state:
    st.caption(f"Last updated: {st.session_state['last_updated'].strftime('%Y-%m-%d %H:%M:%S')}")

grants = st.session_state.get('grants', [])

if grants:
    df = pd.DataFrame(grants)
    
    # Display summary metrics
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Opportunities Found", len(grants))
    
    with col2:
        # Calculate Potential Revenue
        # Formula: (Avg Value * Count of Grants) * (Win Prob / 100)
        potential_revenue = (avg_grant_value * len(grants)) * (win_prob / 100)
        st.metric("Potential Revenue (Scenario)", f"${potential_revenue:,.2f}")
    
    st.subheader(f"Scenario: {win_prob}% Win Rate on {len(grants)} Grants")
    st.progress(win_prob / 100)

    # Display Data Table
    st.markdown("### Grant Details")
    
    # Make links clickable in the dataframe display? 
    # Streamlit dataframe doesn't render HTML defaults easily without config, 
    # so we might use st.data_editor or just a loop for better formatting if the table is simple.
    # Let's try a nice card layout for the top items or a clean table.
    
    # Clean up the dataframe for display
    display_df = df[['Title', 'Agency', 'Date', 'Link']].copy()
    
    st.dataframe(
        display_df,
        column_config={
            "Link": st.column_config.LinkColumn("Grant Link")
        },
        use_container_width=True
    )
    
    # Expander with raw data for debugging/details
    with st.expander("View Raw Data Snippets"):
        st.json(grants)

else:
    st.warning("No Department of Education grants found in the latest feed content. Check back later or verify the feed connection.")
    st.info("Note: The feed fetches the latest aggregate opportunities. If no recent updates are tagged 'ED', this list may be empty.")

# Footer
st.markdown("---")
st.markdown("*Data Source: Grants.gov Public RSS Feed*")
